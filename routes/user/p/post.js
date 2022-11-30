module.exports = async (ctx, next) => {
  const {data, db, query, nkcModules, state, params} = ctx;
  const {page = 0, t = ''} = query;
  const {targetUser, user} = data;
  const {pageSettings} = state;
  const {uid} = params;
  let canManageFid = [];
  if(data.user) {
    canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
  }
  // 获取用户能够访问的专业ID
  const accessibleFid = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, data.user);
  //获取专家权限
  const superModerator = ctx.permission("superModerator");
  //获取用户回复列表
  if(Number(page) === 0) {
    data.userPostSummary = await db.UserModel.getUserPostSummary(targetUser.uid);
    // nkcModules.apiFunction.shuffle(data.userPostSummary);
  }
  const q = {
    uid,
    mainForumsId: {$in: accessibleFid},
    type: 'post',
  };
  if(
    (!user || user.uid !== targetUser.uid) &&
    (!ctx.permission("getPostAuthor"))
  ) {
    q.anonymous = false;
  }
  // 如果是已登录用户
  if(user) {
    // 不具有特殊专家权限的用户
    if(!ctx.permission("superModerator")) {
      // 获取用户能够管理的专业ID
      // 三种情况：
      // 1. 已审核
      // 2. 未审核，且是自己的发表的内容
      // 3. 未审核，且是自己有权限管理的专业里的内容
      q.$or = [
        {
          reviewed: true
        },
        {
          reviewed: false,
          uid: user.uid
        },
        {
          reviewed: false,
          mainForumsId: {
            $in: canManageFid
          }
        }
      ]
    }
  } else {
    q.reviewed = true;
  }
  const count = await db.PostModel.countDocuments(q);
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardThreadList);
  const posts = await db.PostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const results = [];

  const tids = new Set(), threadsObj = {};
  posts.map(post => {
    tids.add(post.tid);
  });
  let threads = await db.ThreadModel.find({tid: {$in: [...tids]}});
  threads = await db.ThreadModel.extendThreads(threads, {
    forum: false,
    firstPost: true,
    firstPostUser: false,
    userInfo: false,
    lastPost: false,
    lastPostUser: false,
    firstPostResource: true,
    htmlToText: true,
    removeLink: true,
  });
  threads.map(thread => {
    threadsObj[thread.tid] = thread;
  });
  const haveReviewPermission = ctx.permission('review');
  for(const post of posts) {
    const thread = threadsObj[post.tid];
    if(post.disabled || thread.disabled || thread.recycleMark) {
      // 根据权限过滤掉 屏蔽、退休的内容
      if(user) {
        // 不具有特殊权限且不是自己
        if(!superModerator && user.uid !== targetUser.uid) {
          const mainForumsId = post.mainForumsId;
          let has = false;
          for(const fid of mainForumsId) {
            if(canManageFid.includes(fid)) {
              has = true;
            }
          }
          if(!has) continue;
        }
      } else {
        continue;
      }
    }
    post.c = nkcModules.nkcRender.htmlToPlain(post.c, 200);
    // post.c = nkcModules.apiFunction.obtainPureText(post.c, true, 200);
    let firstPost = {};
    let link;
    if(thread.oc === post.pid) {
      firstPost = post;
      link = `/t/${thread.tid}`
    } else {
      firstPost = thread.firstPost;
      const m = {pid: post.pid};
      if(!ctx.permission("displayDisabledPosts")) {
        m.disabled = false;
      }
      link = await db.PostModel.getUrl(post.pid);
    }
    if(firstPost.t.length > 20) {
      firstPost.t = firstPost.t.slice(0, 20) + "...";
    }
    const result = {
      postType: thread.oc === post.pid?'postToForum': 'postToThread',
      parentPostId: post.parentPostId,
      tid: thread.tid,
      cover: firstPost.cover,
      time: post.toc,
      pid: post.pid,
      anonymous: post.anonymous,
      abstract: nkcModules.nkcRender.replaceLink(post.abstract),
      content: nkcModules.nkcRender.replaceLink(post.c),
      title: nkcModules.nkcRender.replaceLink(firstPost.t),
      link,
      reviewed: post.reviewed,
    };
    result.toDraft = (result.postType === "postToForum" && thread.recycleMark) || (result.postType === "postToThread" && post.toDraft && post.disabled);
    result.disabled = (result.postType === "postToForum" && thread.disabled) || (result.postType === "postToThread" && !post.toDraft && post.disabled);
    let postLogOne;
    if(result.toDraft) {
      postLogOne = await db.DelPostLogModel.findOne({"threadId": thread.tid, postId: post.pid, "postType": "post", "modifyType": false}).sort({toc: -1});
    } else if (result.disabled) {
      postLogOne = await db.DelPostLogModel.findOne({"threadId": thread.tid, postId: post.pid, "postType": "post", "modifyType": false}).sort({toc: -1});
    } else {
      postLogOne = await db.ReviewModel.findOne({pid: post.pid}).sort({toc: -1});
    }
    if(postLogOne && (haveReviewPermission || result.toDraft)) {
      result.reviewReason = postLogOne.reason;
    }
    results.push(result);
  }
  data.paging = paging;
  data.posts = results;
  data.permissions.type = 'post';
  await next();
}
