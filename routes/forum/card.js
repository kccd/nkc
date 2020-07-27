const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data, params} = ctx;
    const {fid} = params;
    const forum = await db.ForumModel.findOnly({fid});
    await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
    if(data.user) {
      const subForumsId = await db.SubscribeModel.getUserSubForumsId(data.user.uid);
      data.subscribed = subForumsId.includes(fid);
    }
    // 获取最新三篇文章
    // let posts = await db.PostModel.find({
    //   mainForumsId: {$in: [fid]},
    //   disabled: false,
    //   reviewed: true,
    //   toDraft: {$ne: true},
    //   type: "thread",
    // }).sort({toc: -1}).limit(3);
    // const threadsId = posts.map(post => post.tid);
    // const threads = await db.ThreadModel.find({
    //   tid: {$in: threadsId},
    //   mainForumsId: {$in: [fid]}, disabled: false, reviewed: true, recycleMark: {$ne: true}
    // }).sort({toc: -1});
    // data.latestThreads = await db.ThreadModel.extendThreads(threads, {
    //   firstPost: true
    // });
    data.forum = forum;
    await next();
  });
module.exports = router;