const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "review/review.pug";
    const {nkcModules, data, db, query} = ctx;
    const {page=0} = query;
    const {user} = data;
    const recycleId = await db.SettingModel.getRecycleId();
    const q = {
      reviewed: false,
      disabled: false,
      mainForumsId: {$ne: recycleId}
    };
    if(!ctx.permission("superModerator")) {
      const forums = await db.ForumModel.find({moderators: user.uid});
      const fid = forums.map(f => f.fid);
      q.mainForumsId = {
        $in: fid
      }
    }
    const count = await db.PostModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count, 100);
    let posts = await db.PostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    posts = await db.PostModel.extendPosts(posts, {
      uid: data.user?data.user.uid: '',
      visitor: data.user
    });
    data.results = [];
    const tid = new Set(), uid = new Set();
    for(const post of posts) {
      tid.add(post.tid);
      uid.add(post.uid);
    }
    let threads = await db.ThreadModel.find({tid: {$in: [...tid]}, disabled: false});
    threads = await db.ThreadModel.extendThreads(threads, {
      lastPost: false,
      lastPostUser: false,
      forum: true,
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
      let user;
      if(post.anonymous) {
        thread.uid = "";
        post.uid = "";
        post.uidlm = "";
      } else {
        user = usersObj[post.uid];
        if(!user) continue;
      }
      let type, link;
      if(thread.oc === post.pid) {
        if(thread.recycleMark) {
          continue;
        }
        type = "thread";
        link = `/t/${thread.tid}`;
      } else {
        type = "post";
        link = await db.PostModel.getUrl(post);
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
  .put("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {pid} = body;

    const post = await db.PostModel.findOne({pid});

    if(!post) ctx.throw(404, `未找到ID为${pid}的post`);
    if(post.reviewed) ctx.throw(400, "内容已经被审核过了，请刷新");

    const forums = await db.ForumModel.find({fid: {$in: post.mainForumsId}});
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(data.user?data.user.uid: '');
        if(isModerator) break;
      }
    }

    if(!isModerator) ctx.throw(403, `您没有权限审核该内容，pid: ${pid}`);

    let type = "passPost";
    await post.update({
      reviewed: true
    });
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
    if(thread.oc === post.pid) {
      await thread.update({
        reviewed: true
      });
      type = "passThread";
    }
    await thread.updateThreadMessage(false);

    await db.ReviewModel.newReview(type, post, data.user);

    const message = await db.MessageModel({
      _id: await db.SettingModel.operateSystemID("messages", 1),
      r: post.uid,
      ty: "STU",
      c: {
        type: "passReview",
        pid: post.pid
      }
    });
    await message.save();
    await ctx.redis.pubMessage(message);
    await next();
  });
module.exports = router;
