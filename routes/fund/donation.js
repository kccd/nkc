const Router = require('koa-router');
const directAlipay = require('direct-alipay');
const {directConfig} = require('../../settings/alipaySecret');
directAlipay.config(directConfig);
const donationRouter = new Router();
donationRouter
	.use('/', async (ctx, next) => {
		await next();
	})
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_fund_donation.pug';
		const {db, data, query} = ctx;
		if(query.fundId) {
			data.fundId = query.fundId.toUpperCase();
		}
		data.funds  = await db.FundModel.find({disabled: false, history: false}).sort({toc: 1});
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {money, fundId, anonymous} = body;
		if(money >= 0.1) {

		} else {
			ctx.throw(400, '捐款金额不能小于0.1元。');
		}
		const {user} = data;
		if(!anonymous && !user) ctx.throw(400, '非匿名捐款要求用户必须登陆，请登录后再试。');
		const id = Date.now();
		const bill = await db.FundBillModel.findOne({_id: id});
		if(bill) ctx.throw(500, '交易编号重复，请重新提交。');
		let fund;
		if(fundId) {
			fund = await db.FundModel.findOnly({_id: fundId});
		}
		const params = {
			out_trade_no: id,
			subject: `科创基金${fund?` - ${fund.name}`: ''}`,
			body: `捐款${money}元`,
			total_fee: money
		};
		data.url = directAlipay.buildDirectPayURL(params);
		const newBill = db.FundBillModel({
			_id: id,
			uid: user?user.uid: '',
			abstract: '捐款',
			notes: `捐款${money}元`,
			money: money,
			from: {
				type: 'user',
				id: user?user.uid: '',
				anonymous: !!anonymous
			},
			to: {
				type: fundId?'fund': 'fundPool',
				id: fundId?fundId: ''
			},
			verify: false
		});
		await newBill.save();
		await next();
	})
	.get('/return', async (ctx, next) => {
		const {data, query} = ctx;
		await directAlipay.verify(query);
		const {is_success, out_trade_no} = query;
		if(is_success !== 'T') {
			ctx.throw(500, '接口调用失败。');
		}
		data.alipayReturn = true;
		data.billId = out_trade_no;
		ctx.template = 'interface_fund_donation.pug';
		await next();
	})
	.post('/verify', async (ctx, next) => {
		const {db, body} = ctx;
		delete body.url;
		delete body.method;
		await directAlipay.verify(body);
		const {trade_status, total_fee, trade_no, out_trade_no} = body;
		const bill = await db.FundBillModel.findOne({_id: out_trade_no, money: parseFloat(total_fee)});
		if(!bill) {
			return ctx.body = 'success';
		} else {
			if(bill.verify) {
				return ctx.body = 'success';
			} else {
				if(['TRADE_FINISHED', 'TRADE_SUCCESS'].includes(trade_status)) {
					bill.verify = true;
					if(!bill.notes.includes('支付宝交易号')) {
						bill.notes += `，支付宝交易号：${trade_no}`;
					}
					await bill.save();
					return ctx.body = 'success';
				} else {
					if(!bill.notes.includes('支付宝交易号')) {
						bill.notes = `，交易未完成。状态：${trade_status}，支付宝交易号：${trade_no}`;
						await bill.save();
					}
				}
			}
		}
		await next();
	});
module.exports = donationRouter;
