const Router = require('koa-router');
const appRouter = new Router();
const meRouter = require('./me');
const userRouter = require('./user');
appRouter
	.use('/', async (ctx, next) => {
		await next();
	})
	.use('/u', userRouter.routes(), userRouter.allowedMethods())
	.use('/me', meRouter.routes(), meRouter.allowedMethods());
module.exports = appRouter;