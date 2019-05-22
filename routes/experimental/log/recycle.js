const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const allMarkThreads = await db.ThreadModel.find({ "recycleMark": true, "mainForumsId": { "$nin": ["recycle"] } }).sort({toc: -1});
    let threads = [];
    for (var i in allMarkThreads) {
      const delThreadLog = await db.DelPostLogModel.findOne({ "postType": "thread", "threadId": allMarkThreads[i].tid});
      if(delThreadLog){
        let thread = allMarkThreads[i];
        thread = thread.toObject();
        thread.markTime = delThreadLog.toc;
        thread.markUser = await db.UserModel.findOne({uid: delThreadLog.userId});
        thread.markReason = delThreadLog.reason;
        threads.push(thread);
      }
    }
    data.threads = await db.ThreadModel.extendThreads(threads, {
      category: false,
      lastPost: false
    });
    data.threads.map(thread => {
      thread.firstPost = thread.firstPost.toObject();
    });
    ctx.template = "experimental/log/recycle.pug";
    await next();
  });
module.exports = router;