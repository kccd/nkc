const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		data.subscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
		await next();
	});
module.exports = subscribeRouter;