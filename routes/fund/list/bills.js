const Router = require('koa-router');
const apiFn = require('../../../nkcModules/apiFunction');
const billsRouter = new Router();
billsRouter
	.get('/', async (ctx, next) => {
		const {query, data, db, params} = ctx;
		const fundId = params.fundId.toUpperCase();
		const fund = await db.FundModel.findOnly({_id: fundId});
		const page = query.page? parseInt(query.page): 0;
		const q = {};
		if(!data.userOperationsId.includes('displayFundNoVerifyBills')) {
			q.verify = true;
		}
		q.$or = [
			{
				'from.type': 'fund',
				'from.id': fundId
			},
			{
				'to.type': 'fund',
				'to.id': fundId
			}
		];
		let bills = await db.FundBillModel.find(q).sort({toc: 1});
		let total = 0;
		bills.map(b => {
			if(b.verify) {
				if(b.from.id === fundId) {
					total += b.money*-1;
				} else {
					total += b.money;
				}
			}
			b.balance = total;
			if(!data.userOperationsId.includes('displayFundBillsSecretInfo')) {
				b.otherInfo = {};
			}
		});
		data.balance = total;
		const count = bills.length;
		const paging = apiFn.paging(page, count);
		bills = bills.reverse();
		const targetBills = bills.slice(paging.start, (paging.start + paging.perpage));
		data.bills = await Promise.all(targetBills.map(async b => {
			await b.extendFromInfo();
			await b.extendToInfo();
			await b.extendApplicationForm();
			await b.extendUser();
			await b.extendFund();
			return b;
		}));
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
		const fund = await db.FundModel.findOnly({_id: fundId});
		if(!fund.ensureOperatorPermission('financialStaff', user)) ctx.throw(403,'抱歉！您不是该基金项目的财务人员，无法完成此操作。');
		const {changed} = bill;
		let total = 0;
		if(changed === 0) ctx.throw(400, '金额变动不能小于0元');
		if(changed > 0) { //从总基金池转入
			const bills = await db.FundBillModel.find({fundPool: true});
			bills.map(b => {
				total += -1*b.changed;
			});
			if(changed > total) ctx.throw(400, `总资金余额不足。`);
			bill.fundPool = true;
		} else {
			const bills = await db.FundBillModel.find({fundId});
			bills.map(b => {
				total += b.changed;
			});
			if(changed > total) ctx.throw(400, `该基金余额不足。`);
		}
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
		const {user} = data;
		const bill = await db.FundBillModel.findOnly({_id: billId});
		const fund = await db.FundModel.findOnly({_id: bill.fundId});
		if(!fund.ensureOperatorPermission('financialStaff', user)) ctx.throw(403,'抱歉！您不是该基金项目的财务人员，无法完成此操作。');
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
		await bill.deleteOne();
		await next();
	})
	.put('/:billId', async (ctx, next) => {
		const {body} = ctx;
		const {obj} = body;
		const {bill} = ctx.data;
		await bill.updateOne(obj);
		await next();
	});
module.exports = billsRouter;
