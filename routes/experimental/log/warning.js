const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, query, data, db} = ctx;
    const {page=0} = query;
    const q = {};
    const count = await db.PostWarningModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const logs = await db.PostWarningModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const uid = new Set(), pid = new Set(), tid = new Set();
    logs.map(log => {
      if(log.handlerId) uid.add(log.handlerId);
      if(log.modifierId) uid.add(log.modifierId);
      uid.add(log.tUid);
      pid.add(log.pid);
      tid.add(log.tid);
    });
    const users = await db.UserModel.find({uid: {$in: [...uid]}});
    const posts = await db.PostModel.find({pid: {$in: [...pid]}});
    let threads = await db.ThreadModel.find({tid: {$in: [...tid]}});
    threads = await db.ThreadModel.extendThreads(threads, {
      forum: false,
      category: false,
      lastPost: false,
      lastPostUser: false,
      resource: false,
      firstPostUser: false
    });
    const usersObj = {}, postsObj = {}, threadsObj = {};

    users.map(u => {
      usersObj[u.uid] = u;
    });

    posts.map(post => {
      postsObj[post.pid] = post;
    });

    threads.map(thread => {
      threadsObj[thread.tid] = thread;
    });

    data.warnings = [];
    for(let log of logs) {
      const {pid, tid, tUid, handlerId} = log;
      const user = usersObj[tUid];
      const post = postsObj[pid];
      const thread = threadsObj[tid];
      const handler = usersObj[handlerId];

      if(!user) continue;
      if(!handler) continue;
      if(!post) continue;
      if(!thread) continue;

      log = log.toObject();

      if(log.modifierId) log.modifier = usersObj[log.modifierId];


      log.targetUser = user;
      log.post = post;
      log.handler = handler;
      log.thread = thread;
      data.warnings.push(log);

      if(thread.oc !== post.pid) {
        const step = await db.ThreadModel.getPostStep(tid, {pid});
        log.link = `/t/${tid}?page=${step.page}&highlight=${pid}#${pid}`;
      } else {
        log.link = `/t/${thread.tid}`;
      }
    }
    ctx.template = "experimental/log/warning.pug";
    await next();
  });
module.exports = router;
