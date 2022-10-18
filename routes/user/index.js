const Router = require('koa-router');
const billRouter = require('./bills');
const productionRouter = require('./production');
const bannedRouter = require('./banned');
const draftsRouter = require('./drafts');
const settingRouter = require('./settings');
const transactionRouter = require('./transaction');
// const bannerRouter = require('./banner');
const clearRouter = require("./clear");
const subRouter = require("./sub");
// const profileRouter = require("./profile");
const transferRouter = require("./transfer");
const myProblemsRouter = require("./myProblems");
const destroyRouter = require("./destroy");
const codeRouter = require('./code');
// 违规记录
const violationRouter = require("./violationRecord");
const userRouter = new Router();
// 隐藏用户主页
const hideRouter = require("./hide");
// 用户创建的专业
const forumRouter = require("./forum");
// 手机号验证
const phoneVerifyRouter = require("./phoneVerify");
// 查询可能存在的小号
const altRouter = require('./alt');
// 访问身份认证上传的材料
const verifiedAssets = require("./verifiedAssets");
//获取用户个人主页信息
const userHomeInfoRouter = require("./userHomeInfo");
//获取用户卡片
const userHomeCardRouter = require("./userHomeCard");
//获取用户链接
const navLinksRouter = require("./navLinks");
// 请求内容
const contentRouter = require("./content");
const profileRouter = require('./p/index');
const subscribeRouter = require('./subscribe');
const userPanelRouter = require('./userPanel');


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
  .use("/:uid", async (ctx, next) => {
    const {data, db, params, state} = ctx;
    data.targetUser = await db.UserModel.findOne({uid: params.uid});
    if(!data.targetUser) ctx.throw(404, `不存在ID为${params.uid}的用户`);
    //拓展用户权限
    await data.targetUser.extendRoles();
    //拓展用户等级
    await data.targetUser.extendGrade();
    await data.targetUser.extendDraftCount();
    await db.UserModel.extendUserInfo(data.targetUser);
    //获取用户专栏文章数量
    await data.targetUser.extendColumnAndZoneThreadCount();
    await next();
  })
  .use('/:uid', async (ctx, next) => {
    const {db, state, data} = ctx;
    if(
      !state.uid ||
      state.uid !== data.targetUser.uid
    ) {
      await db.UserModel.checkAccessControlPermissionWithThrowError({
        uid: state.uid,
        rolesId: data.userRoles.map(role => role._id),
        gradeId: state.uid? data.userGrade._id: undefined,
        isApp: state.isApp,
      });
    }
    ctx.template = 'vueRoot/index.pug';
    await next();
  })
  .get('/:uid', async (ctx, next) => {
    const {db, data, state} = ctx;
    if(data.targetUser && state.uid && data.targetUser.uid !== state.uid) {
      await db.UsersGeneralModel.updateUserAccessLogs(state.uid, data.targetUser.uid);
    }
    await next();
  })
  .get('/:uid', async (ctx, next) => {
    //访问用户个人主页
    //获取用户个人主页信息
    const {params, state, db, data, query, nkcModules} = ctx;
    const {uid} = params;
    const {nkcRender} = nkcModules;
    const {pageSettings} = state;
    const {user} = data;
    // data.complaintTypes = ctx.state.language.complaintTypes;

    const {t, page=0, from} = query;
    data.t = t;

    const targetUser = await db.UserModel.findById(uid);
    await targetUser.extendGrade();
    data.targetUser = targetUser;

    if(state.uid !== targetUser.uid) {
      targetUser.description = nkcRender.replaceLink(targetUser.description);
    }
    // 用户积分
    if(ctx.permission('viewUserScores')) {
      data.targetUserScores = await db.UserModel.getUserScores(targetUser.uid);
    }
    // 如果未登录或者已登录但不是自己的名片
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

    // 禁止游客查看开除学籍用户的名片
    if (!user && targetUser.certs.includes('banned')) {
      nkcModules.throwError(404, "根据相关法律法规和政策，该内容不予显示", "noPermissionToVisitHiddenUserHome");
    }

    await db.UserModel.extendUsersInfo([targetUser]);
    if(user) {
      data.inBlacklist = !!(await db.BlacklistModel.findOne({uid: user.uid, tUid: targetUser.uid}));
    }
    //获取用户名片，用户消息等信息
    if(from && from === "panel" && ctx.request.get('FROM') === "nkcAPI") {
      if(data.user) {
        data.subscribed = state.subUsersId.includes(uid);
        data.friend = null;
        const friend = await db.FriendModel.findOne({uid: data.user.uid, tUid: data.targetUser.uid});
        if(friend) {
          const categories = await db.FriendsCategoryModel.find({
            uid: data.user.uid,
          });
          data.friendCategories = categories.map(c => {
            const {_id,name, description, friendsId} = c;
            return {
              _id,
              name,
              description,
              usersId: friendsId
            };
          })
          data.friend = {
            uid: friend.uid,
            tUid: friend.tUid,
            ...friend.info
          };
          if(!data.friend.phone || !data.friend.phone.length) data.friend.phone = [''];
        }
      }
      return await next();
    } else if(from === 'message') {
      if(!user) ctx.throw(403, '你暂未登录');
      data.friend = await db.FriendModel.findOne({uid: user.uid, tUid: targetUser.uid});
      data.friendCategories = await db.FriendsCategoryModel.find({uid: user.uid}).sort({toc: -1});
      data.targetUserName = targetUser.username || targetUser.uid;
      if(data.friend && data.friend.info.name) {
        data.targetUserName = data.friend.info.name || data.targetUserName;
      }
      ctx.template = 'message/appUserDetail/appUserDetail.pug';
      return await next();
    } else {
      if(state.uid && state.uid === targetUser.uid) {
        ctx.redirect(`/u/${targetUser.uid}/profile/moment`);
      }
    }
    await next();
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `推送/取消热门 用户: ${uid}`;
    await next();
  })
	.use('/:uid/transaction', transactionRouter.routes(), transactionRouter.allowedMethods())
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
	.use('/:uid/bills', billRouter.routes(), billRouter.allowedMethods())
	// .use('/:uid/banner', bannerRouter.routes(), bannerRouter.allowedMethods())
	.use('/:uid/banned', bannedRouter.routes(), bannedRouter.allowedMethods())
	.use('/:uid/drafts', draftsRouter.routes(), draftsRouter.allowedMethods())
	.use('/:uid/settings', settingRouter.routes(), settingRouter.allowedMethods())
  .use("/:uid/sub", subRouter.routes(), subRouter.allowedMethods())
  .use("/:uid/clear", clearRouter.routes(), clearRouter.allowedMethods())
  .use("/:uid/transfer", transferRouter.routes(), transferRouter.allowedMethods())
	.use('/:uid/production', productionRouter.routes(), productionRouter.allowedMethods())
  // .use("/:uid/profile", profileRouter.routes(), profileRouter.allowedMethods())
  .use("/:uid/destroy", destroyRouter.routes(), destroyRouter.allowedMethods())
  .use("/:uid/myProblems", myProblemsRouter.routes(), myProblemsRouter.allowedMethods())
  .use("/:uid/violationRecord", violationRouter.routes(), violationRouter.allowedMethods())
  .use("/:uid/hide", hideRouter.routes(), hideRouter.allowedMethods())
  .use("/:uid/forum", forumRouter.routes(), forumRouter.allowedMethods())
  .use("/:uid/phoneVerify", phoneVerifyRouter.routes(), phoneVerifyRouter.allowedMethods())
  .use("/:uid/alt", altRouter.routes(), altRouter.allowedMethods())
  .use("/:uid/code", codeRouter.routes(), codeRouter.allowedMethods())
  .use("/:uid/verifiedAssets", verifiedAssets.routes(), verifiedAssets.allowedMethods())
  .use("/:uid/userHome", userHomeInfoRouter.routes(), userHomeInfoRouter.allowedMethods())
  .use("/:uid/userHomeCard", userHomeCardRouter.routes(), userHomeCardRouter.allowedMethods())
  .use("/:uid/navLinks", navLinksRouter.routes(), navLinksRouter.allowedMethods())
  .use("/:uid/content", contentRouter.routes(), contentRouter.allowedMethods())
  .use("/:uid/profile", profileRouter.routes(), profileRouter.allowedMethods())
  .use("/:uid/userPanel", userPanelRouter.routes(), userPanelRouter.allowedMethods())
module.exports = userRouter;
