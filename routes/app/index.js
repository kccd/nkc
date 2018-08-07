const Router = require('koa-router');
const appRouter = new Router();
const meRouter = require('./me');
appRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.use('/me', meRouter.routes(), meRouter.allowedMethods());
module.exports = appRouter;