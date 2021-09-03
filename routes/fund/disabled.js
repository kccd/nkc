const Router = require('koa-router');
const disabledRouter = new Router();
disabledRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.funds = await db.FundModel.find({disabled: true});
		ctx.template = 'fund/list/disabledFund.pug';
		await next();
	});
module.exports = disabledRouter;