module.exports = async (ctx, next) => {
  const {db, data, nkcModules, query, state} = ctx;
  const {targetUser, user} = data;
  const {pageSettings} = state;
  const {page = 0} = query;
  const q = {
    uid: targetUser.uid,
    type: "post"
  };
  const count = await db.PostModel.count(q);
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardThreadList);
  let posts = await db.PostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const accessibleForumsId = await db.ForumModel.getAccessibleForumsId(user.roles, user.grade, user);
  const threadsId = [], parentPostId = [];
  posts.map(post => {
    threadsId.push(post.tid);
    if(post.parentPostId) parentPostId.push(post.parentPostId);
  });
  let threads = await db.ThreadModel.find({
    mainForumsId: {$in: accessibleForumsId},
    tid: {$in: threadsId}});
  threads = await db.ThreadModel.extendThreads(threads, {
    forum: true,
    category: false,
    firstPost: true,
    firstPostUser: true,
    userInfo: false,
    lastPost: false,
    lastPostUser: false,
    firstPostResource: false,
    htmlToText: true,
    count: 200,
    showAnonymousUser: false,
    excludeAnonymousPost: false,
  });
  const threadsObj = {};
  threads.map(thread => {
    threadsObj[thread.tid] = thread;
  });
  let parentPosts = await db.PostModel.find({
    pid: {$in: parentPostId},
    mainForumsId: {$in: accessibleForumsId},
  });
  parentPosts = await db.PostModel.extendPosts(parentPosts, {
    htmlToText: true,
    renderHTML: false,
  });
  const parentPostsObj = {};
  parentPosts.map(post => {
    parentPostsObj[post.pid] = post;
  });
  data.posts = [];
  for(let post of posts) {
    let thread = threadsObj[post.tid];
    post = post.toObject();
    if(!thread) {
      post.threadInfo = "权限不足，暂无权阅读原文";
    } else if(thread.disabled) {
      post.threadInfo = "原文已被屏蔽，暂无法阅读";
    } else if(thread.recycleMark) {
      post.threadInfo = "原文已被退回修改，暂无法阅读";
    } else if(!thread.reviewed) {
      post.threadInfo = "原文正在等待审核，暂无法阅读";
    } else {
      post.thread = thread;
    }
    if(post.parentPostId) {
      post.parentPost = parentPostsObj[post.parentPostId];
    }
    post.url = await db.PostModel.getUrl(post.pid);
    post.c = nkcModules.apiFunction.obtainPureText(post.c, true, 200);
    data.posts.push(post);
  }
  data.paging = paging;
  await next();
};
