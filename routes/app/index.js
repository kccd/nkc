const Router = require('koa-router');
const appRouter = new Router();
const meRouter = require('./me');
const userRouter = require('./user');
const threadRouter = require('./thread');
const searchRouter = require('./search');
const scoreChangeRouter = require('./scoreChange');
const latestRouter = require('./latest');
appRouter
	.use('/', async (ctx, next) => {
		await next();
	})
	.use('/latest', latestRouter.routes(), latestRouter.allowedMethods())
	.use('/u', userRouter.routes(), userRouter.allowedMethods())
	.use('/me', meRouter.routes(), meRouter.allowedMethods())
	.use('/scoreChange', scoreChangeRouter.routes(), scoreChangeRouter.allowedMethods())
	.use('/thread', threadRouter.routes(), threadRouter.allowedMethods())
	.use('/search', searchRouter.routes(), searchRouter.allowedMethods());
module.exports = appRouter;