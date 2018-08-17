const Router = require('koa-router');
const appRouter = new Router();
const meRouter = require('./me');
const userRouter = require('./user');
const threadRouter = require('./thread');
const scoreChangeRouter = require('./scoreChange');
appRouter
	.use('/', async (ctx, next) => {
		await next();
	})
	.use('/u', userRouter.routes(), userRouter.allowedMethods())
	.use('/me', meRouter.routes(), meRouter.allowedMethods())
	.use('/scoreChange', scoreChangeRouter.routes(), scoreChangeRouter.allowedMethods())
	.use('/thread', threadRouter.routes(), threadRouter.allowedMethods());
module.exports = appRouter;