const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, data, db, query} = ctx;
    const {page=0} = query;
    const count = await db.ReviewModel.count();
    const paging = nkcModules.apiFunction.paging(page, count);
    const reviews = await db.ReviewModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const uids = new Set(), pids = new Set(), tids = new Set();
    reviews.map(r => {
      uids.add(r.uid);
      uids.add(r.handlerId);
      pids.add(r.pid);
      tids.add(r.tid);
    });
    const users = await db.UserModel.find({uid: {$in: [...uids]}});
    const posts = await db.PostModel.find({pid: {$in: [...pids]}});
    let threads = await db.ThreadModel.find({tid: {$in: [...tids]}});
    const usersObj = {}, postsObj = {}, threadsObj = {};
    users.map(user => {
      usersObj[user.uid] = user;
    });
    posts.map(post => {
      postsObj[post.pid] = post;
    });
    threads = await db.ThreadModel.extendThreads(threads, {
      category: false,
      lastPost: false,
      lastPostUser: false,
      firstPostResource: false,
      forum: false
    });
    threads.map(thread => {
      threadsObj[thread.tid] = thread;
    });
    data.reviews = [];
    for(let review of reviews) {
      const {uid, handlerId, pid, tid} = review;
      review = review.toObject();
      const user = usersObj[uid];
      const handler = usersObj[handlerId];
      const thread = threadsObj[tid];
      const post = postsObj[pid];
      review.user = {
        username: user.username,
        uid: user.uid
      };
      review.handler = {
        username: handler.username,
        uid: handler.uid
      };
      review.post = {
        pid: post.pid,
        t: post.t,
        c: post.c,
        toc: post.toc,
        tid: post.tid
      };
      review.thread = {
        tid: thread.tid,
        toc: thread.toc,
        firstPost: {
          t: thread.firstPost.t,
          c: thread.firstPost.c
        }
      };
      // review.link = `/t/${thread.tid}?page=${step.page}&highlight=${pid}#${pid}`;
      review.link = await db.PostModel.getUrl(pid);
      data.reviews.push(review);
    }
    data.paging = paging;
    ctx.template = "experimental/log/review.pug";
    await next();
  });
module.exports = router;