const Router = require('koa-router');
const billsRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
billsRouter
	.get('/', async (ctx, next) => {
		const {query, data, db} = ctx;
		const {type} = query;
		data.type = type;
		const page = query.page? parseInt(query.page): 0;
		const q = {};
		if(type !== 'all') {
			q.fundPool = true;
		}
		let bills = await db.FundBillModel.find(q).sort({toc: 1});
		let total = 0;
		bills.map(b => {
			if(b.fundPool) {
				total = total - b.changed;
			} else {
				total += b.changed;
			}
			b.balance = total;
		});
		const count = bills.length;
		const paging = apiFn.paging(page, count);
		data.paging = paging;
		bills = bills.reverse();
		const targetBills = bills.slice(paging.start, (paging.start + paging.perpage));
		data.bills = await Promise.all(targetBills.map(async b => {
			await b.extendUser();
			await b.extendFund();
			return b;
		}));
		ctx.template = 'interface_fund_general_bills.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {bill} = body;
		const {user} = data;
		if(data.userLevel < 7) ctx.throw(401, '权限不足');
		bill._id = Date.now();
		bill.uid = user.uid;
		bill.changed = -1*bill.changed;
		bill.fundPool = true;
		const newBill = db.FundBillModel(bill);
		await newBill.save();
		await next();
	})
	.use('/:billId', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {billId} = params;
		if(data.userLevel < 7) ctx.throw(401, '权限不足');
		data.bill = await db.FundBillModel.findOnly({_id: billId});
		await next();
	})
	.get('/:billId', async (ctx, next) => {
		ctx.template = 'interface_fund_bill.pug';
		await next();
	})
	.del('/:billId', async (ctx, next) => {
		const {bill} = ctx.data;
		await bill.remove();
		await next();
	})
	.patch('/:billId', async(ctx, next) => {
		const {body} = ctx;
		const {obj} = body;
		const {bill} = ctx.data;
		await bill.update(obj);
		await next();
	});
module.exports = billsRouter;