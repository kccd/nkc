const Router = require('koa-router');
const meRouter = new Router();
meRouter
	.get('/', async (ctx, next) => {
		const {db, data} = ctx;
		data.modifyUsername = await db.TypesOfScoreChangeModel.findOnly({_id: 'modifyUsername'});
		await next();
	});
module.exports = meRouter;