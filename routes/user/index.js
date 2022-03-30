const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const billRouter = require('./bills');
const productionRouter = require('./production');
const bannedRouter = require('./banned');
const draftsRouter = require('./drafts');
const settingRouter = require('./settings');
const transactionRouter = require('./transaction');
// const bannerRouter = require('./banner');
const clearRouter = require("./clear");
const subRouter = require("./sub");
const profileRouter = require("./profile");
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
//用户关注的内容
const sRouter = require('./subscribe/index');

const path = require('path');


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
    const {data, db, params} = ctx;
    data.targetUser = await db.UserModel.findOne({uid: params.uid});
    if(!data.targetUser) ctx.throw(404, `不存在ID为${params.uid}的用户`);
    await data.targetUser.extendRoles();
    await data.targetUser.extendGrade();
    await data.targetUser.extendDraftCount();
    await db.UserModel.extendUserInfo(data.targetUser);
    await next();
  })
  .use('/:uid', async (ctx, next) => {
    const {data, db, state, nkcModules} = ctx;
    const {user} = data;
    if(!user) {
      const visitSettings = await db.SettingModel.getSettings('visit');
      if(visitSettings.userHomeLimitVisitor.status) {
        data.description = nkcModules.nkcRender.plainEscape(visitSettings.userHomeLimitVisitor.description);
        ctx.status = 401;
        return ctx.body = nkcModules.render(path.resolve(__dirname, '../../pages/filter_visitor.pug'), data, state);
      }
    }
    await next();
  })
  .get(['/:uid', '/:uid/content/moment', '/:uid/content/post', '/:uid/content/thread', '/:uid/content/follow', '/:uid/content/fans', '/:uid/s/thread', '/:uid/s/column', '/:uid/s/user', '/:uid/s/forum', '/:uid/s/blackList'], async (ctx, next) => {
    //访问用户个人主页
    ctx.template = 'vueRoot/index.pug';
    // ctx.template = "user/user.pug";
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
  .use("/:uid/profile", profileRouter.routes(), profileRouter.allowedMethods())
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
  .use("/:uid/s", sRouter.routes(), sRouter.allowedMethods())
module.exports = userRouter;
