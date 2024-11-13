const { renderHTMLByJSON } = require('../../nkcModules/nkcRender/json');
const { subscribeSources } = require('../../settings/subscribe');
const router = require('koa-router')();
router
  // 动态
  .get('/moment', async (ctx, next) => {
    const { data, db, query, params, state, nkcModules, permission } = ctx;
    const { uid } = params;
    const { page = 0 } = query;
    const targetUser = await db.UserModel.findOnly({ uid });
    const match = {
      uid: targetUser.uid,
      status: (await db.MomentModel.getMomentStatus()).normal,
      parent: '',
    };
    const count = await db.MomentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsListData(
      moments,
      state.uid,
    );
    data.paging = paging;
    await next();
  })
  // 回复
  .get('/post', async (ctx, next) => {
    const { data, db, query, params, state, nkcModules } = ctx;
    const { uid } = params;
    const { user } = data;
    const { pageSettings } = state;
    const { page = 0 } = query;
    const targetUser = await db.UserModel.findOnly({ uid });
    //获取用户回复列表
    if (Number(page) === 0) {
      data.userPostSummary = await db.UserModel.getUserPostSummary(
        targetUser.uid,
      );
      // nkcModules.apiFunction.shuffle(data.userPostSummary);
    }
    const accessibleFid = await db.ForumModel.getAccessibleForumsId(
      data.userRoles,
      data.userGrade,
      data.user,
    );
    let canManageFid = [];
    if (data.user) {
      canManageFid = await db.ForumModel.canManagerFid(
        data.userRoles,
        data.userGrade,
        data.user,
      );
    }
    const q = {
      uid,
      mainForumsId: { $in: accessibleFid },
    };
    if (
      (!user || user.uid !== targetUser.uid) &&
      !ctx.permission('getPostAuthor')
    ) {
      q.anonymous = false;
    }
    // 如果是已登录用户
    if (user) {
      // 不具有特殊专家权限的用户
      if (!ctx.permission('superModerator')) {
        // 获取用户能够管理的专业ID
        // 三种情况：
        // 1. 已审核
        // 2. 未审核，且是自己的发表的内容
        // 3. 未审核，且是自己有权限管理的专业里的内容
        q.$or = [
          {
            reviewed: true,
          },
          {
            reviewed: false,
            uid: user.uid,
          },
          {
            reviewed: false,
            mainForumsId: {
              $in: canManageFid,
            },
          },
        ];
      }
    } else {
      q.reviewed = true;
    }
    const count = await db.PostModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.userCardThreadList,
    );
    const posts = await db.PostModel.find(q)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const results = [];

    const tids = new Set(),
      threadsObj = {};
    posts.map((post) => {
      tids.add(post.tid);
    });
    let threads = await db.ThreadModel.find({ tid: { $in: [...tids] } });
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
    threads.map((thread) => {
      threadsObj[thread.tid] = thread;
    });

    for (const post of posts) {
      const thread = threadsObj[post.tid];
      if (post.disabled || thread.disabled || thread.recycleMark) {
        // 根据权限过滤掉 屏蔽、退休的内容
        if (user) {
          // 不具有特殊权限且不是自己
          if (!superModerator && user.uid !== targetUser.uid) {
            const mainForumsId = post.mainForumsId;
            let has = false;
            for (const fid of mainForumsId) {
              if (canManageFid.includes(fid)) {
                has = true;
              }
            }
            if (!has) {
              continue;
            }
          }
        } else {
          continue;
        }
      }
      post.c = nkcModules.nkcRender.htmlToPlain(
        post.l === 'json' ? renderHTMLByJSON({ json: post.c }) : post.c,
        200,
      );
      // post.c = nkcModules.apiFunction.obtainPureText(post.c, true, 200);
      let firstPost = {};
      let link;
      if (thread.oc === post.pid) {
        firstPost = post;
        link = `/t/${thread.tid}`;
      } else {
        firstPost = thread.firstPost;
        const m = { pid: post.pid };
        if (!ctx.permission('displayDisabledPosts')) {
          m.disabled = false;
        }
        link = await db.PostModel.getUrl(post.pid);
      }
      if (firstPost.t.length > 20) {
        firstPost.t = firstPost.t.slice(0, 20) + '...';
      }
      const result = {
        postType: thread.oc === post.pid ? 'postToForum' : 'postToThread',
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
      result.toDraft =
        (result.postType === 'postToForum' && thread.recycleMark) ||
        (result.postType === 'postToThread' && post.toDraft && post.disabled);
      result.disabled =
        (result.postType === 'postToForum' && thread.disabled) ||
        (result.postType === 'postToThread' && !post.toDraft && post.disabled);
      results.push(result);
    }
    data.posts = results;
    data.paging = paging;

    await next();
  })
  // 文章
  .get('/thread', async (ctx, next) => {
    const { data, db, query, params, state, nkcModules } = ctx;
    const { uid } = params;
    const { user } = data;
    const { pageSettings } = state;
    const { page = 0 } = query;
    const targetUser = await db.UserModel.findOnly({ uid });
    const accessibleFid = await db.ForumModel.getAccessibleForumsId(
      data.userRoles,
      data.userGrade,
      data.user,
    );
    let canManageFid = [];
    if (data.user) {
      canManageFid = await db.ForumModel.canManagerFid(
        data.userRoles,
        data.userGrade,
        data.user,
      );
    }
    const q = {
      uid: targetUser.uid,
      mainForumsId: {
        $in: accessibleFid,
      },
    };
    if (user) {
      // 不具有特殊专家权限的用户
      if (!ctx.permission('superModerator')) {
        // 获取用户能够管理的专业ID
        // 三种情况：
        // 1. 已审核
        // 2. 未审核，且是自己的发表的内容
        // 3. 未审核，且是自己有权限管理的专业里的内容
        q.$or = [
          {
            reviewed: true,
          },
          {
            reviewed: false,
            uid: user.uid,
          },
          {
            reviewed: false,
            mainForumsId: {
              $in: canManageFid,
            },
          },
        ];
      }
    } else {
      q.reviewed = true;
    }
    const count = await db.ThreadModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.userCardThreadList,
    );
    let threads = await db.ThreadModel.find(q, {
      tid: 1,
      hasCover: 1,
      uid: 1,
      oc: 1,
      toc: 1,
      reviewed: 1,
      disabled: 1,
      recycleMark: 1,
      mainForumsId: 1,
    })
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    threads = await db.ThreadModel.extendThreads(threads, {
      forum: false,
      firstPost: true,
      firstPostUser: false,
      userInfo: false,
      lastPost: false,
      lastPostUser: false,
      firstPostResource: true,
      htmlToText: true,
    });
    const results = [];
    for (const thread of threads) {
      if (
        !ctx.permission('getPostAuthor') &&
        (!user || user.uid !== targetUser.uid) &&
        thread.firstPost.anonymous
      ) {
        continue;
      }
      if (thread.disabled || thread.recycleMark) {
        // 根据权限过滤掉 屏蔽、退休的内容
        if (user) {
          // 不具有特殊权限且不是自己
          if (!superModerator && user.uid !== targetUser.uid) {
            const mainForumsId = thread.mainForumsId || [];
            let has = false;
            for (const fid of mainForumsId) {
              if (canManageFid.includes(fid)) {
                has = true;
              }
            }
            if (!has) {
              continue;
            }
          }
        } else {
          continue;
        }
      }

      const result = {
        postType: 'postToForum',
        tid: thread.tid,
        cover: thread.firstPost.cover,
        time: thread.toc,
        pid: thread.oc,
        abstract: nkcModules.nkcRender.replaceLink(thread.firstPost.abstract),
        title: nkcModules.nkcRender.replaceLink(thread.firstPost.t),
        content: nkcModules.nkcRender.replaceLink(thread.firstPost.c),
        anonymous: thread.firstPost.anonymous,
        link: `/t/${thread.tid}`,
        reviewed: thread.reviewed,
      };

      result.toDraft = thread.recycleMark;
      result.disabled = thread.disabled;

      results.push(result);
    }
    data.posts = results;
    data.paging = paging;
    await next();
  })
  // 关注
  .get('/follow', async (ctx, next) => {
    const { data, db, query, params, state, nkcModules } = ctx;
    const { uid } = params;
    const { pageSettings } = state;
    const { page = 0 } = query;
    const targetUser = await db.UserModel.findOnly({ uid });
    const q = {
      uid: targetUser.uid,
      source: subscribeSources.user,
      cancel: false,
    };
    const count = await db.SubscribeModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.userCardUserList,
    );
    if (!data.noPromission) {
      const subs = await db.SubscribeModel.find(q, { sid: 1 })
        .sort({ toc: -1 })
        .skip(paging.start)
        .limit(paging.perpage);
      data.users = await db.UserModel.find({
        uid: { $in: subs.map((s) => s.sid) },
      });
      data.users = await db.UserModel.extendUsersInfo(data.users);
      let newUsers = [];
      for (let obj of data.users) {
        let newObj = {};
        newObj.avatar = obj.avatar;
        newObj.description = obj.description;
        newObj.info = obj.info;
        newObj.username = obj.username;
        newObj.uid = obj.uid;
        newUsers.push(newObj);
      }
      data.paging = paging;
      data.users = newUsers;
      delete data.user;
      delete data.targetUser;
      delete data.operationId;
    }
    await next();
  })
  // 取消关注
  // .del("/follow", async (ctx, next) => {
  //   await next();
  // })
  // 粉丝
  .get('/fans', async (ctx, next) => {
    const { data, db, query, params, state, nkcModules, permission } = ctx;
    const { uid } = params;
    const { pageSettings } = state;
    const { page = 0 } = query;
    const targetUser = await db.UserModel.findOnly({ uid });
    const q = {
      sid: targetUser.uid,
      source: subscribeSources.user,
      cancel: false,
    };
    const count = await db.SubscribeModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.userCardUserList,
    );
    if (!data.noPromission) {
      const subs = await db.SubscribeModel.find(q, { uid: 1 })
        .sort({ toc: -1 })
        .skip(paging.start)
        .limit(paging.perpage);
      // 我的关注
      const follow = await db.SubscribeModel.find(
        {
          uid: targetUser.uid,
          source: subscribeSources.user,
          cancel: false,
        },
        { sid: 1 },
      );
      data.users = await db.UserModel.find({
        uid: { $in: subs.map((s) => s.uid) },
      });
      data.users = await db.UserModel.extendUsersInfo(data.users);
      let newUsers = [];
      for (let obj of data.users) {
        let newObj = {};
        // 如果我的关注中关注了粉丝,那么 =true
        newObj.mutualAttention = false;
        for (let f of follow) {
          if (f.sid === obj.uid) {
            newObj.mutualAttention = true;
            break;
          }
        }
        newObj.avatar = obj.avatar;
        newObj.description = obj.description;
        newObj.info = obj.info;
        newObj.username = obj.username;
        newObj.uid = obj.uid;
        newUsers.push(newObj);
      }
      data.users = newUsers;
      data.paging = paging;
      delete data.user;
      delete data.targetUser;
      delete data.operationId;
    }
    await next();
  });
// // 关注粉丝
// .post("/fans", async (ctx, next) => {
//   await next();
// })
// // 取消关注
// .del("/fans", async (ctx, next) => {
//   await next();
// });
module.exports = router;
