const Router = require("koa-router");
const router = new Router();
router
  .get("/t", async (ctx, next) => {
    const {nkcModules, db, data, query, params, state} = ctx;
    data.threadListStyle = state.threadListStyle;
    // data.threadPostList = state.pageSettings.threadPostList;
    const {page = 0} = query;
    const {user} = data;
    const {uid} = params;
    if(uid !== user.uid) ctx.throw(403, "权限不足");
    const q = {
      type: "thread",
      uid: user.uid,
      cancel: false
    };
    const count = await db.SubscribeModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const sub = await db.SubscribeModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const subTid = sub.map(s => s.tid);
    const threads = await db.ThreadModel.find({tid: {$in: subTid}});
    let threads_ = [];
    for(const t of threads) {
      const index = subTid.indexOf(t.tid);
      threads_[index] = t;
    }
    threads_ = threads_.filter(t => !!t);
    data.threads = await db.ThreadModel.extendThreads(threads_, {
      htmlToText: true
    });
    data.threads.forEach(t => {
      t.lastPost.user.avatar = nkcModules.tools.getUrl("userAvatar", t.lastPost.user.avatar, "sm")
      t.firstPost.user.avatar = nkcModules.tools.getUrl('userAvatar', t.firstPost.user.avatar, 'sm')
    });
    data.paging = paging;
    // ctx.template = "user/sub/threads.pug";
    ctx.remoteTemplate = "user/sub/threads.pug";
    await next();
  });
module.exports = router;
