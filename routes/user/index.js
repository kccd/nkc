const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const billRouter = require('./bills');
const productionRouter = require('./production');
const bannedRouter = require('./banned');
const draftsRouter = require('./drafts');
const settingRouter = require('./settings');
const authRouter = require('./auth');
const transactionRouter = require('./transaction');
// const bannerRouter = require('./banner');
const clearRouter = require("./clear");
const friendsRouter = require('./friends');
const kcbRouter = require('./kcb');
const subRouter = require("./sub");
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {username, uid} = query;
    const targetUsers = [];
    if(username) {
      const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
    	if(user) targetUsers.push(user);
    }
    if(uid) {
    	const user = await db.UserModel.findOne({uid});
    	if(user) targetUsers.push(user);
    }
    data.targetUsers = [];
    for(const u of targetUsers) {
      await db.UserModel.extendUserInfo(u);
      data.targetUsers.push(u.toObject());
    }
    await next();
  })
  .get("/:uid", async (ctx, next) => {
    const {params, state, db, data, query, nkcModules} = ctx;
    const {uid} = params;
    const {pageSettings} = state;
    const {user} = data;

    data.complaintTypes = ctx.state.language.complaintTypes;

    const {t, page=0, from} = query;
    data.t = t;

    const targetUser = await db.UserModel.findOnly({uid});
    await targetUser.extendGrade();
    data.targetUser = targetUser;
    await db.UserModel.extendUsersInfo([targetUser]);
    if(from && from === "panel") {
      return await next();
    }
    const targetUserSubForums = await db.SubscribeModel.find({
      uid: targetUser.uid,
      type: "forum"
    }, {fid: 1});
    data.targetUserSubForums = await db.ForumModel.find({
      fid: {
        $in: targetUserSubForums.map(f => f.fid)
      }
    });
    // 获取用户能够访问的专业ID
    const accessibleFid = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, data.user);
    if(user) {
      const subs = await db.SubscribeModel.find({
        type: {
          $in: ["user", "forum"]
        },
        uid: user.uid
      }, {
        tUid: 1,
        fid: 1,
        type: 1
      });
      data.userSubUid = [];
      data.userSubFid = [];
      subs.map(s => {
        if(s.type === "user") data.userSubUid.push(s.tUid);
        if(s.type === "forum") data.userSubFid.push(s.fid);
      });
    }

    const targetUserDigestThreads = await db.ThreadModel.find({
      mainForumsId: {
        $in: accessibleFid
      },
      uid: targetUser.uid,
      disabled: false,
      reviewed: true,
      digest: true
    }).sort({toc: -1}).limit(10);

    data.targetUserDigestThreads = await db.ThreadModel.extendThreads(targetUserDigestThreads, {
      forum: true,
      firstPost: true,
      firstPostUser: true,
      userInfo: false,
      lastPost: false,
      lastPostUser: false,
      firstPostResource: false,
      htmlToText: false,
    });

    data.recommendThreads = await db.ThreadModel.getRecommendThreads(accessibleFid);
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(accessibleFid);

    if(t !== "fans") {
      const sub = await db.SubscribeModel.find({
        type: "user",
        tUid: targetUser.uid
      }, {uid: 1}).sort({toc: -1}).limit(9);
      const targetUserFans = await db.UserModel.find({
        uid: {
          $in: sub.map(s => s.uid)
        }
      });
      data.targetUserFans = await db.UserModel.extendUsersInfo(targetUserFans);
    }

    if(t !== "follow") {
      const sub = await db.SubscribeModel.find({
        type: "user",
        uid: targetUser.uid
      }, {tUid: 1}).sort({toc: -1}).limit(9);
      const targetUserFollowers = await db.UserModel.find({
        uid: {
          $in: sub.map(s => s.tUid)
        }
      });
      data.targetUserFollowers = await db.UserModel.extendUsersInfo(targetUserFollowers);
    }

    let paging = {};

    let canManageFid = [];

    if(data.user) {
      canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
    }

    const superModerator = ctx.permission("superModerator");

    if(!t) {
      if(Number(page) === 0) {
        data.userPostSummary = await db.UserModel.getUserPostSummary(targetUser.uid);
        // nkcModules.apiFunction.shuffle(data.userPostSummary);
      }
      const q = {
        uid,
        // disabled: false,
        mainForumsId: {$in: accessibleFid}
      };
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
      const count = await db.PostModel.count(q);
      paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardThreadList);
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
      });
      threads.map(thread => {
        threadsObj[thread.tid] = thread;
      });

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

        post.c = nkcModules.apiFunction.obtainPureText(post.c, true, 200);
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
          hasCover: thread.hasCover,
          time: post.toc,
          pid: post.pid,
          abstract: post.abstract,
          content: post.c,
          title: firstPost.t,
          link,
          reviewed: post.reviewed
        };
        result.toDraft = (result.postType === "postToForum" && thread.recycleMark) || (result.postType === "postToThread" && post.toDraft && post.disabled);
        result.disabled = (result.postType === "postToForum" && thread.disabled) || (result.postType === "postToThread" && !post.toDraft && post.disabled);
        results.push(result);
      }
      data.posts = results;
    } else if(t === "thread") {
      const q = {
        uid: targetUser.uid,
        /*disabled: false,
        recycleMark: {
          $ne: true
        },*/
        mainForumsId: {
          $in: accessibleFid
        }
      };
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
      const count = await db.ThreadModel.count(q);
      paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardThreadList);
      let threads = await db.ThreadModel.find(q, {
        tid: 1,
        hasCover: 1,
        uid: 1,
        oc: 1,
        toc: 1,
        reviewed: 1,
        disabled: 1,
        recycleMark: 1,
        mainForumsId: 1
      }).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
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
        if(thread.disabled || thread.recycleMark) {
          // 根据权限过滤掉 屏蔽、退休的内容
          if(user) {
            // 不具有特殊权限且不是自己
            if(!superModerator && user.uid !== targetUser.uid) {
              const mainForumsId = thread.mainForumsId || [];
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

        const result = {
          postType: "postToForum",
          tid: thread.tid,
          hasCover: thread.hasCover,
          time: thread.toc,
          pid: thread.oc,
          abstract: thread.firstPost.abstract,
          title: thread.firstPost.t,
          content: thread.firstPost.c,
          link: `/t/${thread.tid}`,
          reviewed: thread.reviewed
        };

        result.toDraft = thread.recycleMark;
        result.disabled = thread.disabled;

        results.push(result);
      }
      data.posts = results;

    } else {
      // 关注或粉丝
      if(Number(page) >= 1) {
        if(!ctx.permission("viewUserAllFansAndFollowers")) {
          if(!user) {
            data.noPromission = true;
          } else {
            if(user.uid !== targetUser.uid) {
              const isFriend = await db.FriendModel.findOne({uid: user.uid, tUid: targetUser.uid});
              if(!isFriend) data.noPromission = true;
            }
          }
        }
      }

      if(t === "follow") {
        const q = {
          uid: targetUser.uid,
          type: "user"
        };
        const count = await db.SubscribeModel.count(q);
        paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardUserList);
        if(!data.noPromission) {
          const subs = await db.SubscribeModel.find(q, {tUid: 1}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
          data.users = await db.UserModel.find({uid: {$in: subs.map(s => s.tUid)}});
          await db.UserModel.extendUsersInfo(data.users);
        }
      } else {
        const q = {
          tUid: targetUser.uid,
          type: "user"
        };
        const count = await db.SubscribeModel.count(q);
        paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardUserList);
        if(!data.noPromission) {
          const subs = await db.SubscribeModel.find(q, {uid: 1}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
          data.users = await db.UserModel.find({uid: {$in: subs.map(s => s.uid)}});
          await db.UserModel.extendUsersInfo(data.users);
        }
      }
    }
    data.paging = paging;
    ctx.template = "/user/user.pug";
    await next();
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `推送/取消热门 用户: ${uid}`;
    await next();
  })
  .use('/:uid/kcb', kcbRouter.routes(), kcbRouter.allowedMethods())
	.use('/:uid/transaction', transactionRouter.routes(), transactionRouter.allowedMethods())
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
	.use('/:uid/bills', billRouter.routes(), billRouter.allowedMethods())
	.use('/:uid/auth', authRouter.routes(), authRouter.allowedMethods())
	// .use('/:uid/banner', bannerRouter.routes(), bannerRouter.allowedMethods())
	.use('/:uid/banned', bannedRouter.routes(), bannedRouter.allowedMethods())
	.use('/:uid/drafts', draftsRouter.routes(), draftsRouter.allowedMethods())
	.use('/:uid/settings', settingRouter.routes(), settingRouter.allowedMethods())
  .use('/:uid/friends', friendsRouter.routes(), friendsRouter.allowedMethods())
  .use("/:uid/sub", subRouter.routes(), subRouter.allowedMethods())
  .use("/:uid/clear", clearRouter.routes(), clearRouter.allowedMethods())
	.use('/:uid/production', productionRouter.routes(), productionRouter.allowedMethods());
module.exports = userRouter;
