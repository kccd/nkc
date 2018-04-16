const Router = require("koa-router");
const settingRouter = new Router();
const infoRouter = require('./info');
const resumeRouter = require('./resume');
settingRouter
	.get(['/', '/avatar'], async (ctx, next) => {
		ctx.template = 'interface_user_settings_avatar.pug';
		await next();
	})
	.use('/resume', resumeRouter.routes(), resumeRouter.allowedMethods())
	.use('/info', infoRouter.routes(), infoRouter.allowedMethods());
module.exports = settingRouter;