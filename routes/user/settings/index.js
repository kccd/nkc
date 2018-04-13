const Router = require("koa-router");
const settingRouter = new Router();
settingRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_user_settings.pug';
		await next();
	});
module.exports = settingRouter;