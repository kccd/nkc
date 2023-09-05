const Router = require('koa-router');
const { subscribeSources } = require('../../settings/subscribe');
const router = new Router();

router.get('/', async (ctx, next) => {
  //获取用户卡片中的内容
  const { data, db, query, params, state, nkcModules, permission } = ctx;
  const { uid } = params;
  const { user } = data;
  const { nkcRender } = nkcModules;
  const { pageSettings } = state;
  const { t, page = 0, from } = query;
  data.t = t;
  const targetUser = await db.UserModel.findOnly({ uid });
  //如果未登录
  if (!permission('hideUserHome') && !user) {
    nkcModules.throwError(
      404,
      '根据相关法律法规和政策吗，该内容不予显示',
      'noPermissionToVisitHiddenUserHome',
    );
  }
  if (t !== 'fans') {
    const sub = await db.SubscribeModel.find(
      {
        source: subscribeSources.user,
        cancel: false,
        sid: targetUser.uid,
      },
      { uid: 1 },
    )
      .sort({ toc: -1 })
      .limit(9);
    const targetUserFans = await db.UserModel.find({
      uid: {
        $in: sub.map((s) => s.uid),
      },
    });
    data.targetUserFans = await db.UserModel.extendUsersInfo(targetUserFans);
  }
  if (t !== 'follow') {
    const sub = await db.SubscribeModel.find(
      {
        source: subscribeSources.user,
        cancel: false,
        uid: targetUser.uid,
      },
      { sid: 1 },
    )
      .sort({ toc: -1 })
      .limit(9);
    const targetUserFollowers = await db.UserModel.find({
      uid: {
        $in: sub.map((s) => s.sid),
      },
    });
    data.targetUserFollowers = await db.UserModel.extendUsersInfo(
      targetUserFollowers,
    );
  }
  // 获取用户能够访问的专业ID
  const accessibleFid = await db.ForumModel.getAccessibleForumsId(
    data.userRoles,
    data.userGrade,
    data.user,
  );
  let paging = {};
  let canManageFid = [];
  if (data.user) {
    canManageFid = await db.ForumModel.canManagerFid(
      data.userRoles,
      data.userGrade,
      data.user,
    );
  }
  const superModerator = ctx.permission('superModerator');
  if (!t) {
    //获取用户动态列表
    const match = {
      uid: targetUser.uid,
      status: (await db.MomentModel.getMomentStatus()).normal,
      parent: '',
    };
    const count = await db.MomentModel.countDocuments(match);
    paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match)
      .sort({ top: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsListData(
      moments,
      state.uid,
    );
  } else if (t === 'post') {
    //获取用户回复列表
    if (Number(page) === 0) {
      data.userPostSummary = await db.UserModel.getUserPostSummary(
        targetUser.uid,
      );
      // nkcModules.apiFunction.shuffle(data.userPostSummary);
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
    paging = nkcModules.apiFunction.paging(
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
      post.c = nkcModules.nkcRender.htmlToPlain(post.c, 200);
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
  } else if (t === 'thread') {
  } else {
    //关注或粉丝
    if (Number(page) >= 1) {
      if (!ctx.permission('viewUserAllFansAndFollowers')) {
        if (!user) {
          data.noPromission = true;
        } else {
          if (user.uid !== targetUser.uid) {
            const isFriend = await db.FriendModel.findOne({
              uid: user.uid,
              tUid: targetUser.uid,
            });
            if (!isFriend) {
              data.noPromission = true;
            }
          }
        }
      }
    }

    if (t === 'follow') {
      //关注的用户
      const q = {
        source: subscribeSources.user,
        uid: targetUser.uid,
        cancel: false,
      };
      const count = await db.SubscribeModel.countDocuments(q);
      paging = nkcModules.apiFunction.paging(
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
      }
    } else {
      //粉丝
      const q = {
        source: subscribeSources.user,
        sid: targetUser.uid,
        cancel: false,
      };
      const count = await db.SubscribeModel.countDocuments(q);
      paging = nkcModules.apiFunction.paging(
        page,
        count,
        pageSettings.userCardUserList,
      );
      if (!data.noPromission) {
        const subs = await db.SubscribeModel.find(q, { uid: 1 })
          .sort({ toc: -1 })
          .skip(paging.start)
          .limit(paging.perpage);
        data.users = await db.UserModel.find({
          uid: { $in: subs.map((s) => s.uid) },
        });
        data.users = await db.UserModel.extendUsersInfo(data.users);
      }
    }
    //排除封禁用户和名片被屏蔽的用户
    if (data.user && data.users.length) {
      data.users = data.users.filter((u) => {
        u.description = nkcModules.nkcRender.replaceLink(u.description);
        return !u.certs.includes('banned') && !u.hidden;
      });
    }
  }
  data.paging = paging;
  await next();
});

module.exports = router;
