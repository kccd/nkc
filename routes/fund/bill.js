const Router = require('koa-router');
const billRouter = new Router();
billRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		// if(data.userLevel < 7) ctx.throw(403, '权限不足');
		const {from, fid, to, tid, id} = query;
		if(id) {
			data.bill = await db.FundBillModel.findOnly({_id: parseInt(id)});
		}
		data.from = from;
		data.fid = fid;
		data.to = to;
		data.tid = tid;
		data.id = id;
		data.funds = await db.FundModel.find({disabled: false, history: false}).sort({toc: 1});
		ctx.template = 'fund/bills/bill.pug';
		await next();
	});
module.exports = billRouter;