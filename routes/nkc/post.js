const router = require("koa-router")();
router
  .get("/", async(ctx, next) => {
    // 将最新的post直接渲染到页面上
    const {data, db, query, nkcModules} = ctx;
    let {page = 0, t, c} = query;
    if(c === undefined) {
      c = Date.now();
      let url = `/nkc/post?c=${c}`;
      if(t) {
        url += `&t=${t}`;
      }
      return ctx.redirect(url);
    } else {
      c = parseInt(c);
    }
    const match = {
      toc: {$lte: c}
    };
    if(t === 'thread') {
      match.type = 'thread';
    } else if(t === 'post') {
      match.type = 'post';
    } else if(t === 'comment') {
      match.type = 'post';
      match.parentPostId = {$ne: ''};
    } else {

    }

    const recycleId = await db.SettingModel.getRecycleId();

    const count = await db.PostModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count, 100);
    let posts = await db.PostModel
      .find(match)
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    posts = await db.PostModel.extendPosts(posts, {
      visitor: {xsf: 9999},
      renderHTML: true,
      user: true,
      resource: true,
      showAnonymousUser: true,
      url: true
    });

    const forums = await db.ForumModel.find({}, {displayName: 1, fid: 1});
    const forumsObj = {};
    forums.map(forum => forumsObj[forum.fid] = forum);

    const results = [];

    const threadsId = [];

    for(const post of posts) {
      if(post.type === 'thread') continue;
      threadsId.push(post.tid);
    }
    const threads = await db.ThreadModel.find({tid: {$in: threadsId}}, {tid: 1, oc: 1});
    const threadPosts = await db.PostModel.find({pid: {$in: threads.map(thread => thread.oc)}}, {tid: 1, t: 1});
    const threadsObj = {};
    for(const tp of threadPosts) {
      const {tid, t} = tp;
      threadsObj[tid] = {
        tid,
        t
      }
    }

    const colors = ['red', 'green', 'blue', '#791E94', 'yellow', '#87314e'];
    let colorIndex = 0;
    const getColor = () => {
      const color = colors[colorIndex];
      colorIndex ++;
      if(colorIndex > colors.length - 1) {
        colorIndex = 0;
      }
      return color;
    };

    for(const post of posts) {
      let postType;
      if(post.type === 'thread') {
        postType = 'thread';
      } else if(post.parentPostId) {
        postType = 'comment';
      } else {
        postType = 'post';
      }

      let status = 'normal';
      if(postType === 'thread') {
        if(post.mainForumsId.includes(recycleId)) {
          status = 'disabled';
        }
      } else {
        if(post.disabled) {
          if(post.toDraft) {
            status = 'toDraft';
          } else {
            status = 'disabled';
          }
        }
      }

      const _forums = [];

      for(const fid of post.mainForumsId) {
        const forum = forumsObj[fid];
        if(!forum) continue;
        _forums.push(forum);
      }

      let thread;

      if(post.type === 'thread') {
        thread = {
          tid: post.tid,
          t: post.t
        }
      } else {
        thread = threadsObj[post.tid];
      }

      const result = {
        pid: post.pid,
        toc: post.toc,
        user: {
          avatar: post.user.avatar,
          uid: post.user.uid,
          username: post.user.username
        },
        type: postType,
        forums: _forums,
        thread,
        t: post.t,
        c: post.c,
        abstractCn: post.abstractCn,
        abstractEn: post.abstractEn,
        keyWordsCn: post.keyWordsCn,
        keyWordsEn: post.keyWordsEn,
        url: post.url,
        tcId: post.tcId,
        mainForumsId: post.mainForumsId,
        categoriesId: post.categoriesId,
        status,
        borderColor: getColor(),
      }

      results.push(result);
    }

    data.posts = results;
    data.paging = paging;
    data.t = t;
    data.c = c;
    data.nav = 'post';
    ctx.template = "nkc/post/post.pug";
    await next();
  });
module.exports = router;