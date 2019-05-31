const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "review/review.pug";
    const {nkcModules, data, db, query} = ctx;
    const {page=0} = query;
    const {user} = data;
    const accessibleFid = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, user);
    const q = {
      mainForumsId: {
        $in: accessibleFid
      },
      reviewed: false,
      disabled: false
    };
    const count = await db.PostModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count, 100);
    const posts = await db.PostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.results = [];
    const tid = new Set(), uid = new Set();
    for(const post of posts) {
      tid.add(post.tid);
      uid.add(post.uid);
    }
    let threads = await db.ThreadModel.find({tid: {$in: [...tid]}, disabled: false, recycleMark: false});
    threads = await db.ThreadModel.extendThreads(threads, {
      lastPost: false,
      lastPostUser: false,
      forum: false,
      category: false,
      firstPostResource: false
    });
    const users = await db.UserModel.find({uid: {$in: [...uid]}});
    const usersObj = {};
    const threadsObj = {};
    users.map(user => {
      usersObj[user.uid] = user;
    });
    threads.map(thread => {
      threadsObj[thread.tid] = thread;
    });
    for(const post of posts) {
      const thread = threadsObj[post.tid];
      if(!thread) continue;
      const user = usersObj[post.uid];
      if(!user) continue;
      const step = await db.ThreadModel.getPostStep(thread.tid, {pid: post.pid});
      let type, link;
      if(thread.oc === post.pid) {
        type = "thread";
        link = `/t/${thread.tid}`;
      } else {
        type = "post";
        link = `/t/${thread.tid}?page=${step.page}&highlight=${post.pid}#${post.pid}`;
      }
      data.results.push({
        post,
        user,
        thread,
        type,
        link
      });
    }
    data.paging = paging;
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {pid} = body;

    const post = await db.PostModel.findOne({pid});

    const forums = await db.ForumModel.find({fid: {$in: post.mainForumsId}});
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(data.user?data.user.uid: '');
        if(isModerator) break;
      }
    }

    if(!isModerator) ctx.throw(403, `您没有权限审核该内容，pid: ${pid}`);

    await post.update({
      reviewed: true
    });
    const thread = await db.ThreadModel.findOne({oc: post.pid});
    if(thread) {
      await thread.update({
        reviewed: true
      });
    }
    await next();
  });
module.exports = router;