const Router = require("koa-router");
const router = new Router();
const subUserRouter = require('./subscribe/user');
const subForumRouter = require('./subscribe/forum');
const subColumnRouter = require('./subscribe/column');
const subCollectionRouter = require('./subscribe/collection');
const subThreadRouter = require('./subscribe/thread');
const blacklistRouter = require('./subscribe/blackList');
const momentRouter = require('./moment');
const timelineRouter = require('./timeline');
const postRouter = require('./post');
const threadRouter = require('./thread');
const followerRouter = require('./follower');
const fanRouter = require('./fan');
const manageRouter = require('./manage');
const userRouter = require('./subUser');
const financeRouter = require('./finance');
const columnRouter = require('./column');
const draftRouter  = require('./draft');
const noteRouter  = require('./note');
router
  .get('/', async (ctx, next) => {
    //获取主页导航等信息
    const {db, state, data, params, nkcModules } = ctx;
    const {user, targetUser} = data;
    // 验证权限
    // if (user.uid !== targetUser.uid && !ctx.permission("visitAllUserProfile")) {
    //   ctx.throw(403, "权限不足");
    // }
    //获取关注的用户
    const subUsersId = await db.SubscribeModel.getUserSubUsersId(targetUser.uid);
    //获取关注的专栏id
    const subColumnsId = await db.SubscribeModel.getUserSubColumnsId(targetUser.uid);
    //获取关注的专业id
    const subTopicsId = await db.SubscribeModel.getUserSubForumsId(targetUser.uid, "topic");
    const subDisciplinesId = await db.SubscribeModel.getUserSubForumsId(targetUser.uid, "discipline");
    const subForumsId = subTopicsId.concat(subDisciplinesId);
    // 获取用户积分信息
    if(ctx.permission('viewUserScores')) {
      data.targetUserScores = await db.UserModel.getUserScores(targetUser.uid);
    }
    if(
      !ctx.permission('hideUserHome') &&
      (!user || user.uid !== targetUser.uid)
    ) {
      if(targetUser.hidden) {
        nkcModules.throwError(404, "根据相关法律法规和政策，该内容不予显示", "noPermissionToVisitHiddenUserHome");
      }
      if(
        (await db.UserModel.contentNeedReview(targetUser.uid, 'thread')) ||
        (await db.UserModel.contentNeedReview(targetUser.uid, 'post'))
      ) {
        data.contentNeedReview = true;
        data.targetUser.username = '';
        data.targetUser.description = '';
        data.targetUser.avatar = '';
        data.targetUser.banner = '';
      }
    }
    // 获取用户能够访问的专业ID
    data.targetUserSubForums = await db.ForumModel.find({
      fid: {
        $in: subForumsId
      }
    });
    //获取收藏的文章id
    const collectionThreadsId = await db.SubscribeModel.getUserCollectionThreadsId(targetUser.uid);
    if(user && user.uid === targetUser.uid) {
      data.navLinks = [
        {
          name: "我的关注",
          links: [
            {
              type: "subscribe/user",
              url: `/u/${targetUser.uid}/profile/subscribe/user`,
              name: "关注的用户",
              count: subUsersId.length
            },
            {
              type: "subscribe/forum",
              url: `/u/${targetUser.uid}/profile/subscribe/forum`,
              name: "关注的专业",
              count: subForumsId.length
            },
            {
              type: "subscribe/column",
              name: "关注的专栏",
              url: `/u/${targetUser.uid}/profile/subscribe/column`,
              count: subColumnsId.length
            },
            {
              type: "subscribe/collection",
              url: `/u/${targetUser.uid}/profile/subscribe/collection`,
              name: "收藏的文章",
              count: collectionThreadsId.length
            },
            {
              type: 'blacklist',
              name: '黑名单',
              url: `/u/${targetUser.uid}/profile/subscribe/blacklist`,
              count: await db.BlacklistModel.countDocuments({
                uid: targetUser.uid
              }),
            }
          ]
        },
      ];
      data.name = "";
      data.navLinks.map(nav => {
        nav.links.map(link => {
          if (data.type === link.type) data.name = link.name;
        })
      });
    }
    //获取用户个人主页的粉丝和关注
    const fansUsersId = await db.SubscribeModel.getUserFansId(targetUser.uid);

    const latestFansUsersId = fansUsersId.slice(-8);
    const latestSubUsersId = subUsersId.slice(-8);
    const usersId = latestFansUsersId.concat(latestSubUsersId);
    let users = await db.UserModel.find({uid: {$in: usersId}});
    users = await db.UserModel.extendUsersInfo(users);
    const usersObj = {};
    for(const u of users) {
      usersObj[u.uid] = u;
    }

    const targetUserFans = [];
    const targetUserFollowers = [];
    for(const uid of latestFansUsersId) {
      const u = usersObj[uid];
      if(!u) continue;
      targetUserFans.push(u);
    }
    for(const uid of latestSubUsersId) {
      const u = usersObj[uid];
      if(!u) continue;
      targetUserFollowers.push(u);
    }

    data.fansCount = fansUsersId.length;
    data.followersCount = subUsersId.length;
    data.fansUsersId = fansUsersId;
    data.subUsersId = subUsersId;

    data.targetUserFans = targetUserFans;
    data.targetUserFollowers = targetUserFollowers;

    if(state.uid === targetUser.uid) {
      data.code = await db.UserModel.getCode(targetUser.uid);
      data.code = data.code.pop();
    }

    data.authorAccountRegisterInfo = await db.UserModel.getAccountRegisterInfo({
      uid: data.targetUser.uid,
    });

    //用户的黑名单
    const match = {};
    if(user) {
      match.uid = user.uid;
    }
    const bl = await db.BlacklistModel.find(match, {tUid: 1}).sort({toc: -1});
    data.usersBlUid = bl.map(b => {
      return b.tUid
    });
    await next();
  })
  .use('/', async (ctx, next) => {
    const {data, permission, state} = ctx;
    const {user} = data;
    const permissions = {
      reviewed: null,
      disabled: null,
    };
    if(user) {
      if(permission('review')) permissions.reviewed = true;
      if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.disabled = true;
      }
    }
    data.permissions = permissions;
    await next();
  })
  .use('/subscribe', async (ctx, next) => {
    const { query, data, db, state } = ctx;
    let { t } = query;
    const { targetUser } = data;
    data.subscribeTypes = await db.SubscribeTypeModel.getTypesTree(targetUser.uid);
    if (t) {
      data.t = Number(t);
      loop1:
        for (const s of data.subscribeTypes) {
          if (s._id === data.t) {
            data.parentType = s;
            data.childType = undefined;
            break;
          }
          for (const c of s.childTypes) {
            if (c._id === data.t) {
              data.parentType = s;
              data.childType = c;
              break loop1;
            }
          }
        }
    }
    state.match = {};
    if (data.childType) {
      state.match.cid = data.childType._id;
    } else if (data.parentType) {
      const childTypesId = data.parentType.childTypes.map(t => t._id);
      childTypesId.push(data.parentType._id);
      state.match.cid = { $in: childTypesId };
    }
    await next();
  })
  .get('/subscribe', async (ctx, next) => {
    await next();
  })
  .get('/subscribe/user', async (ctx, next) => await next())
  .get('/subscribe/userData', subUserRouter)
  .get('/subscribe/forum', async (ctx, next) => await next())
  .get('/subscribe/forumData', subForumRouter)
  .get('/subscribe/column', async (ctx, next) => await next())
  .get('/subscribe/columnData', subColumnRouter)
  .get('/subscribe/collection', async (ctx, next) => await next())
  .get('/subscribe/collectionData', subCollectionRouter)
  .get('/subscribe/thread', async (ctx, next) => await next())
  .get('/subscribe/threadDate', subThreadRouter)
  .get('/subscribe/blacklist', async (ctx, next) => await next())
  .get('/subscribe/blacklistData', blacklistRouter)
  .get('/subscribe/thread', async (ctx, next) => await next())
  .get('/subscribe/threadData', subThreadRouter)
  .get('/timeline', async (ctx, next) => await next())
  .get('/timelineData', timelineRouter)
  .get('/moment', async (ctx , next) => await next())
  .get('/momentData', momentRouter)
  .get('/post', async (ctx, next) => await next())
  .get('/postData', postRouter)
  .get('/thread', async (ctx, next) => await next())
  .get('/threadData', threadRouter)
  .get('/fan', async (ctx, next) => await next())
  .get('/fanData', fanRouter)
  .get('/follower', async (ctx, next) => await next())
  .get('/followerData', followerRouter)
  .get('/manage', async (ctx, next) => await next())
  .get('/manageData', manageRouter)
  .get('/draft', async (ctx, next) => await next())
  .get('/draftData', draftRouter)
  .get('/note', async (ctx, next) => await next())
  .get('/noteData', noteRouter)
  .get('/finance', async (ctx, next) => await next())
  .get('/financeData',financeRouter)
  .get('/column', async (ctx, next) => await next())
  .get('/columnData', columnRouter)
module.exports = router;

