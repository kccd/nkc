const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_system_settings.pug';
		await next();
	});
module.exports = settingsRouter;