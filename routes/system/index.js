const Router = require('koa-router');
const systemRouter = new Router();
const settingsRouter = require('./settings.js');
systemRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_system.pug';
		await next();
	})
	.use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods());
module.exports = systemRouter;