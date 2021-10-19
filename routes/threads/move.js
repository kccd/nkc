const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, data, body} = ctx;
    const {user} = data;
    const {
      moveType,
      threadsId,
      forums,
      violation,
      reason,
      remindUser,
      threadCategoriesId,
    } = body;

    if(remindUser && !reason) ctx.throw(400, `请输入原因`);

    const forumsObj = {};
    const forumsId = new Set();
    const threadTypesId = new Set();
    const recycleId = await db.SettingModel.getRecycleId();
    for(const forum of forums) {
      const {fid, cid} = forum;
      if(fid === recycleId) ctx.throw(400, "无法将文章移动到回收站");
      const threadTypes = await db.ThreadTypeModel.find({fid}, {cid: 1});
      // 应该排除掉的文章分类
      forum.cids = threadTypes.map(t => (t.cid + ""));
      if(cid) {
        const cidStr = cid + "";
        if(!forum.cids.includes(cidStr)) {
          ctx.throw(400, `文章分类不存在。fid: ${fid}, cid: ${cidStr}`);
        }
        threadTypesId.add(cidStr);
      }
      forumsId.add(fid);
      forumsObj[fid] = forum;
    }

    const threads = await db.ThreadModel.find({tid: {$in: threadsId}});
    // 验证处理者权限
    for(const thread of threads) {
      let isModerator = ctx.permission("superModerator") || await thread.isModerator(user, "or");
      if(!isModerator) ctx.throw(403, `您没有权限处理ID为 ${thread.tid} 的文章`);
    }
    await db.ForumModel.updateCount(threads, false);

    const usersId = threads.map(t => t.uid);
    const users = await db.UserModel.find({uid: {$in: usersId}});
    const usersObj = {};
    users.map(u => usersObj[u.uid] = u);

    const categoryTree = await db.ThreadCategoryModel.getCategoryTree();
    const categoryObj = {};
    for(const c of categoryTree) {
      categoryObj[c._id] = c.nodes.map(n => n._id);
      for(const n of c.nodes) {
        categoryObj[n._id] = [];
      }
    }
    let oldNodesId = [];
    let newNodesId = [];
    for(const c of threadCategoriesId) {
      const nodesId = categoryObj[c.cid];
      if(!nodesId) {
        ctx.throw(500, `文章属性错误 cid: ${c.cid}`);
      }
      oldNodesId = oldNodesId.concat(nodesId);
      if(c.nodeId === 'default') continue;
      const node = categoryObj[c.nodeId];
      if(!node) {
        ctx.throw(500, `文章属性错误 cid: ${c.nodeId}`);
      }
      newNodesId.push(c.nodeId);
    }
    for(const thread of threads) {

      // 处理文章属性
      let {tcId} = thread;
      tcId = tcId.filter(id => !oldNodesId.includes(id));
      tcId = tcId.concat(newNodesId);
      tcId = [...new Set(tcId)];
      thread.tcId = tcId;

      if(moveType === 'add') {
        let {mainForumsId, categoriesId} = thread;
        if(mainForumsId.includes(recycleId)) ctx.throw(403, `无法给回收站中的文章添加专业`);
        // 排除掉已选专业中未被选择的文章分类
        const forumsId_ = [...forumsId];
        mainForumsId = mainForumsId.concat(forumsId_);
        categoriesId = categoriesId.concat([...threadTypesId]);
        const newMainForumsId = [...new Set(mainForumsId)];
        const newCategoriesId = [...new Set(categoriesId)];
        await thread.updateOne({
          mainForumsId: newMainForumsId,
          categoriesId: newCategoriesId,
          tcId
        });
        await thread.updateThreadMessage();
        thread.mainForumsId = newMainForumsId;
        thread.categoriesId = newCategoriesId;
      } else {
        await thread.updateOne({
          mainForumsId: [...forumsId],
          categoriesId: [...threadTypesId],
          disabled: false,
          tcId
        });
        await thread.updateThreadMessage();
        thread.mainForumsId = [...forumsId];
        thread.categoriesId = [...threadTypesId];
      }

      if(violation) {
        const u = usersObj[thread.uid];
        if(!u) continue;
        await db.KcbsRecordModel.insertSystemRecord('violation', u, ctx);
        await db.UsersScoreLogModel.insertLog({
          user: u,
          type: 'score',
          typeIdOfScoreChange: 'violation',
          port: ctx.port,
          ip: ctx.address,
          key: 'violationCount',
          tid: thread.tid,
          description: reason || '移动文章并标记为违规'
        });
      }

      if(remindUser) {
        const newThread = await db.ThreadModel.findOnly({tid: thread.tid}, {mainForumsId: 1});
        const mId = await db.SettingModel.operateSystemID('messages', 1);
        const message = db.MessageModel({
          _id: mId,
          ty: 'STU',
          r: thread.uid,
          c: {
            type: 'moveThread',
            tid: thread.tid,
            rea: reason,
            forumsId: newThread.mainForumsId
          }
        });
        await message.save();
        await ctx.nkcModules.socket.sendMessageToUser(message._id);
      }
    }


    await db.ForumModel.updateCount(threads, true);
    await next();
  });
module.exports = router;
