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
      violationReason,
      remindUser
    } = body;
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
    for(const thread of threads) {
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
          categoriesId: newCategoriesId
        });
        await thread.updateThreadMessage();
        thread.mainForumsId = newMainForumsId;
        thread.categoriesId = newCategoriesId;
      } else {
        await thread.updateOne({
          mainForumsId: [...forumsId],
          categoriesId: [...threadTypesId],
          disabled: false
        });
        await thread.updateThreadMessage();
        thread.mainForumsId = [...forumsId];
        thread.categoriesId = [...threadTypesId];
      }


      // 处理违规
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
          description: violationReason || '移动文章并标记为违规'
        });
        if(remindUser) {
          const mId = await db.SettingModel.operateSystemID('messages', 1);
          const message = db.MessageModel({
            _id: mId,
            ty: 'STU',
            r: thread.uid,
            c: {
              type: 'violation',
              tid: thread.tid,
              rea: violationReason
            }
          });
          await message.save();
          await ctx.nkcModules.socket.sendMessageToUser(message._id);
        }

      }
    }


    await db.ForumModel.updateCount(threads, true);
    await next();
  });
module.exports = router;
