const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, nkcModules, db, query} = ctx;
    const {page = 0} = query;
    const count = await db.DelPostLogModel.count();
    const paging = nkcModules.apiFunction.paging(page, count);
    const delLogs = await db.DelPostLogModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.logs = [];
    for(let log of delLogs) {
      log = log.toObject();
      const {userId, delUserId, postType, postId, threadId, reason, delType} = log;
      const delUser = await db.UserModel.findOne({uid: delUserId});
      if(!delUser) continue;
      let targetUser;
      if(userId) {
        targetUser = await db.UserModel.findOne({uid: userId});
      }
      let thread = await db.ThreadModel.findOne({tid: threadId});
      if(!thread) continue;
      let post;
      if(postType === "post") {
        post = await db.PostModel.findOne({pid: postId});
        if(!post) continue;
      }
      thread = (await db.ThreadModel.extendThreads([thread], {
        forum: false,
        lastPost: false,
        lastPostUser: false,
        category: false,
        firstPostResource: false
      }))[0];
      log.thread = thread;
      log.delUser = delUser;
      log.post = post;
      log.targetUser = targetUser;
      data.logs.push(log);
    }
    data.paging = paging;
    ctx.template = "experimental/log/recycle.pug";
    await next();
  });
module.exports = router;