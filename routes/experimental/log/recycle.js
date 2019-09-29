const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, nkcModules, db, query} = ctx;
    const {page = 0, t, c = ""} = query;
    const q = {};
    data.t = t;
    data.c = c;
    if(t === "username") {
      const tUser = await db.UserModel.findOne({usernameLowerCase: c.toLowerCase()});
      if(!tUser) {
        q.delUserId = "null";
      } else {
        q.delUserId = tUser.uid;
      }
    } else if(t === "uid") {
      q.delUserId = c;
    }
    const count = await db.DelPostLogModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const delLogs = await db.DelPostLogModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
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
      log.link = `/t/${thread.tid}`;
      if(postType === "post") {
        post = await db.PostModel.findOne({pid: postId});
        if(!post) continue;
        const step = await db.ThreadModel.getPostStep(thread.tid, {pid: post.pid});
        // log.link = `/t/${thread.tid}?page=${step.page}&highlight=${post.pid}#${post.pid}`;
        log.link = await db.PostModel.getUrl(post);
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