const Router = require('koa-router');
const theradRouter = new Router();
theradRouter
	.get('/:tid', async (ctx, next) => {
		const {db, data} = ctx;
    // data.modifyUsername = await db.TypesOfScoreChangeModel.findOnly({_id: 'modifyUsername'});
    data.thread = "123"
		await next();
	});
module.exports = theradRouter;