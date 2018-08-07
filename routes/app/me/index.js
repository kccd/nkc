const Router = require('koa-router');
const meRouter = new Router();
const personalRouter = require('./personal');
meRouter
	.get('/', async (ctx, next) => {
		const {db, data} = ctx;
		data.modifyUsername = await db.TypesOfScoreChangeModel.findOnly({_id: 'modifyUsername'});
		await next();
	})
	.use('/personal', personalRouter.routes(), personalRouter.allowedMethods());
module.exports = meRouter;