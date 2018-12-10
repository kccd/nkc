const Router = require('koa-router');
const scoreChangeRouter = new Router();
scoreChangeRouter
	.get('/:_id', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {_id} = params;
		data.type = await db.KcbsTypeModel.findOnly({_id});
		await next();
	});
module.exports = scoreChangeRouter;