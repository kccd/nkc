const Router = require('koa-router');
const historyRouter = new Router();
historyRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.funds = await db.FundModel.find({history: true});
		console.log(data.funds);
		ctx.template = 'interface_fund_histories.pug';
		await next();
	});
module.exports = historyRouter;