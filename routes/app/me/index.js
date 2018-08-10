const Router = require('koa-router');
const meRouter = new Router();
const personalRouter = require('./personal');
const subscribeRouter = require('./subscribe');
meRouter
	.get('/', async (ctx, next) => {
		const {db, data} = ctx;
		data.modifyUsername = await db.TypesOfScoreChangeModel.findOnly({_id: 'modifyUsername'});
		await next();
	})
	.use('/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
	.use('/personal', personalRouter.routes(), personalRouter.allowedMethods());
module.exports = meRouter;