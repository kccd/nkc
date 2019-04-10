const Router = require("koa-router");
const settingRouter = new Router();
const infoRouter = require('./info');
const resumeRouter = require('./resume');
const passwordRouter = require('./password');
const mobileRouter = require('./mobile');
const emailRouter = require('./email');
const verifyRouter = require('./verify');
const transactionRouter = require('./transaction');
const photoRouter = require('./photo');
const certRouter = require('./cert');
const socialRouter = require('./social');
const usernameRouter = require('./username');
const waterRouter = require('./water');
const alipayRouter = require("./alipay");
const bankRouter = require("./bank");
const redEnvelopeRouter = require('./redEnvelope');
settingRouter
	.use('/', async (ctx, next) => {
		const {data, params, db} = ctx;
		const {user} = data;
		const {uid} = params;
		if(!user || user.uid !== uid) ctx.throw(403, '权限不足');
		if(!user.username) return ctx.redirect('/register');
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		data.authLevel = await userPersonal.getAuthLevel();
		await next();
	})
	.get(['/', '/avatar'], async (ctx, next) => {
		ctx.template = 'interface_user_settings_avatar.pug';
		await next();
	})
  .use("/alipay", alipayRouter.routes(), alipayRouter.allowedMethods())
  .use('/red_envelope', redEnvelopeRouter.routes(), redEnvelopeRouter.allowedMethods())
	.use('/transaction', transactionRouter.routes(), transactionRouter.allowedMethods())
	.use('/verify', verifyRouter.routes(), verifyRouter.allowedMethods())
	.use('/username', usernameRouter.routes(), usernameRouter.allowedMethods())
	.use('/resume', resumeRouter.routes(), resumeRouter.allowedMethods())
	.use('/password', passwordRouter.routes(), passwordRouter.allowedMethods())
	.use('/social', socialRouter.routes(), socialRouter.allowedMethods())
	.use('/mobile', mobileRouter.routes(), mobileRouter.allowedMethods())
	.use('/email', emailRouter.routes(), emailRouter.allowedMethods())
	.use('/cert', certRouter.routes(), certRouter.allowedMethods())
	.use('/photo', photoRouter.routes(), photoRouter.allowedMethods())
	.use('/info', infoRouter.routes(), infoRouter.allowedMethods())
  .use("/bank", bankRouter.routes(), bankRouter.allowedMethods())
	.use('/water', waterRouter.routes(), waterRouter.allowedMethods());
module.exports = settingRouter;