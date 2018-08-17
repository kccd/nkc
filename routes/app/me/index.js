const Router = require('koa-router');
const meRouter = new Router();
const personalRouter = require('./personal');
const subscribeRouter = require('./subscribe');
meRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.use('/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
	.use('/personal', personalRouter.routes(), personalRouter.allowedMethods());
module.exports = meRouter;