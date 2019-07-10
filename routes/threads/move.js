const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, data, body} = ctx;
    const {user} = data;
    const {moveType, threadsId, forums} = body;
    const forumsId = new Set();
    const threadTypesId = new Set();
    for(const forum of forums) {
      const {fid, cid} = forum;
      if(fid === "recycle") ctx.throw(400, "无法将文章移动到回收站");
      forumsId.add(fid);
      if(cid) {
        const threadType = await db.ThreadTypeModel.findOne({fid, cid});
        if(!threadType) ctx.throw(400, `文章分类不存在。fid: ${fid}, cid: ${cid}`);
        threadTypesId.add(cid);
      }

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
        mainForumsId = mainForumsId.concat([...forumsId]);
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