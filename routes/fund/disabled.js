const Router = require('koa-router');
const disabledRouter = new Router();
disabledRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.funds = await db.FundModel.find({disabled: true});
		ctx.template = 'interface_fund_disabled.pug';
		await next();
	});
module.exports = disabledRouter;