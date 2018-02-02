const Router = require('koa-router');
const apiFn = require('../../nkcModules/apiFunction');
const billsRouter = new Router();
billsRouter
	.get('/', async (ctx, next) => {
		const {query, data, db, params} = ctx;
		const {fundId} = params;
		const fund = await db.FundModel.findOnly({_id: fundId});
		const page = query.page? parseInt(query.page): 0;
		const count = await db.FundBillModel.count({fundId});
		const paging = apiFn.paging(page, count);
		const bills = await db.FundBillModel.find({fundId}).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
		await Promise.all(bills.map(async b => {
			await b.extendApplicationForm();
			await b.extendUser();
		}));
		data.bills = bills;
		data.fund = fund;
		data.nav = '基金账单';
		ctx.template = 'interface_fund_bills.pug';
		await next();
	});
module.exports = billsRouter;