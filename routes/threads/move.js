const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, data, body} = ctx;
    const {user} = data;
    const {moveType, threadsId, forums} = body;
    const forumsObj = {};
    const forumsId = new Set();
    const threadTypesId = new Set();
    for(const forum of forums) {
      const {fid, cid} = forum;
      if(fid === "recycle") ctx.throw(400, "无法将文章移动到回收站");
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
    if(moveType === "add") {
      for(const thread of threads) {
        let {mainForumsId, categoriesId} = thread;
        // 排除掉已选专业中未被选择的文章分类
        const forumsId_ = [...forumsId];
        for(const forumId of forumsId_) {
          const forum = forumsObj[forumId];
          const {cids} = forum;
          categoriesId = categoriesId.filter(cid => !cids.includes(cid));
        }
        mainForumsId = mainForumsId.concat(forumsId_);
        categoriesId = categoriesId.concat([...threadTypesId]);
        const newMainForumsId = [...new Set(mainForumsId)];
        const newCategoriesId = [...new Set(categoriesId)];
        await thread.update({
          mainForumsId: newMainForumsId,
          categoriesId: newCategoriesId
        });
      }
      await db.ForumModel.updateForumsMessage([...forumsId]);
    } else {
      let oldForumsId = [];
      for(const thread of threads) {
        const {mainForumsId} = thread;
        oldForumsId = oldForumsId.concat(mainForumsId);
        await thread.update({
          mainForumsId: [...forumsId],
          categoriesId: [...threadTypesId]
        });
      }
      oldForumsId = oldForumsId.concat([...forumsId]);
      await db.ForumModel.updateForumsMessage([...new Set(oldForumsId)]);
    }
    await next();
  });
module.exports = router;