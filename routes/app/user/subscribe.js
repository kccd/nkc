const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		data.subscribe = await db.UsersSubscribeModel.findOnly({uid});
		await next();
	});
module.exports = subscribeRouter;