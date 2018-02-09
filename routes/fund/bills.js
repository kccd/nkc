const Router = require('koa-router');
const apiFn = require('../../nkcModules/apiFunction');
const billsRouter = new Router();
billsRouter
	.get('/', async (ctx, next) => {
		const {query, data, db, params} = ctx;
		const fundId = params.fundId.toUpperCase();
		const fund = await db.FundModel.findOnly({_id: fundId});
		const page = query.page? parseInt(query.page): 0;
		let bills = await db.FundBillModel.find({fundId}).sort({toc: 1});
		let total = 0;
		bills.map(b => {
			total += b.changed;
			b.balance = total;
		});
		data.balance = total;
		const count = bills.length;
		const paging = apiFn.paging(page, count);
		bills = bills.reverse();
		const targetBills = bills.slice(paging.start, (paging.start + paging.perpage));
		// const bills = await db.FundBillModel.find({fundId}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		await Promise.all(targetBills.map(async b => {
			await b.extendApplicationForm();
			await b.extendUser();
		}));
		data.bills = bills;
		data.fund = fund;
		data.nav = '基金账单';
		data.paging = paging;
		ctx.template = 'interface_fund_bills.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {db, body, params} = ctx;
		const {user} = ctx.data;
		const {bill} = body;
		const fundId = params.fundId.toUpperCase();
		bill._id = Date.now();
		bill.uid = user.uid;
		bill.fundId = fundId;
		const newBill = db.FundBillModel(bill);
		await newBill.save();
		await next();
	})
	.use('/:billId', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {billId} = params;
		const bill = await db.FundBillModel.findOnly({_id: billId});
		const fund = await db.FundModel.findOnly({_id: bill.fundId});
		data.bill = bill;
		data.fund = fund;
		data.nav = bill._id;
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
	.patch('/:billId', async (ctx, next) => {
		const {body} = ctx;
		const {obj} = body;
		const {bill} = ctx.data;
		await bill.update(obj);
		await next();
	});
module.exports = billsRouter;