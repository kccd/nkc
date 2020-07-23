const Router = require('koa-router');
const alipay = require("../../nkcModules/alipay2");
const directAlipay = alipay.getDonationDirectAlipay();
const donationRouter = new Router();
donationRouter
	.use('/', async (ctx, next) => {
		await next();
	})
	.get('/', async (ctx, next) => {
		const {db, data, query} = ctx;
		const {getUrl} = query;
		if(!getUrl) {
			ctx.template = 'interface_fund_donation.pug';
			if(query.fundId) {
				data.fundId = query.fundId.toUpperCase();
			}
			data.funds  = await db.FundModel.find({disabled: false, history: false}).sort({toc: 1});
			data.nav = '赞助';
			if(query.error) {
				data.error = query.error;
				ctx.template = 'interface_fund_donation_error.pug';
			}
		} else {
			let {money, anonymous, type, redirect, fundId} = query;
			money = money?parseInt(money): 0;
			let abstract;
			if(type === 'refund') {
				if(money <= 0) {
					ctx.throw(400, '退款金额错误！');
				}
				abstract = '退款';
			} else {
				abstract = '赞助';
				if(money < 20) {
					ctx.throw(400, '单笔赞助金额不能少于20元。');
				}
				if(money > 10000) {
					ctx.throw(400, '单笔赞助金额不能超过10000元，请分批次赞助。');
				}
			}
			const {user} = data;
			if(!anonymous && !user) ctx.throw(400, '非匿名赞助要求用户必须登录，请登录后再试。');
			const id = Date.now();
			const bill = await db.FundBillModel.findOne({_id: id});
			if(bill) ctx.throw(500, '交易编号重复，请重新提交。');
			let fund;
			if(fundId) {
				fund = await db.FundModel.findOnly({_id: fundId});
			}
			const params = {
				out_trade_no: id,
				subject: `科创基金${fund?` - ${fund.name}`: ' - 资金池'}`,
				body: `${abstract}${money}元`,
				total_fee: money
			};
			data.url = directAlipay.buildDirectPayURL(params);
			const newBill = db.FundBillModel({
				_id: id,
				uid: user?user.uid: '',
				abstract: abstract,
				notes: `${abstract}${money}元`,
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
			if(redirect) {
				return ctx.redirect(data.url);
			}
		}
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {fundId, anonymous, type} = body;
		const money = body.money?parseInt(body.money): 0;
		let abstract;
		if(type === 'refund') {
			if(money <= 0) {
				ctx.throw(400, '退款金额错误！');
			}
			abstract = '退款';
		} else {
			abstract = '赞助';
			if(money < 20) {
				ctx.throw(400, '单笔赞助金额不能少于20元。');
			}
			if(money > 10000) {
				ctx.throw(400, '单笔赞助金额不能超过10000元，请分批次赞助。');
			}
		}
		const {user} = data;
		if(!anonymous && !user) ctx.throw(400, '非匿名赞助要求用户必须登录，请登录后再试。');
		const id = Date.now();
		const bill = await db.FundBillModel.findOne({_id: id});
		if(bill) ctx.throw(500, '交易编号重复，请重新提交。');
		let fund;
		if(fundId) {
			fund = await db.FundModel.findOnly({_id: fundId});
		}
		const params = {
			out_trade_no: id,
			subject: `科创基金${fund?` - ${fund.name}`: ' - 资金池'}`,
			body: `${abstract}${money}元`,
			total_fee: money
		};
		data.url = directAlipay.buildDirectPayURL(params);
		const newBill = db.FundBillModel({
			_id: id,
			uid: user?user.uid: '',
			abstract: abstract,
			notes: `${abstract}${money}元`,
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
		const {data, query, db} = ctx;
		await directAlipay.verify(query);
		const {is_success, out_trade_no, buyer_email, trade_no} = query;
		const bill = await db.FundBillModel.findOnly({_id: out_trade_no});
		bill.otherInfo = {
			transactionNumber: trade_no,
			account: buyer_email,
			paymentType: 'alipay'
		};
		if(is_success !== 'T') {
			bill.otherInfo.error = `调用接口失败，${JSON.stringify(query)}`;
			ctx.throw(500, '接口调用失败。');
		}
		await bill.save();
		data.alipayReturn = true;
		data.billId = out_trade_no;
		ctx.template = 'interface_fund_donation.pug';
		if(data.user) {
		  await db.KcbsRecordModel.insertSystemRecord('fundDonation', data.user, ctx);
		}
		await next();
	})
	.post('/verify', async (ctx, next) => {
		const {db, body} = ctx;
		delete body.url;
		delete body.method;
		await directAlipay.verify(body);
		const {trade_status, total_fee, out_trade_no, trade_no, buyer_email} = body;
		const bill = await db.FundBillModel.findOne({_id: out_trade_no, money: parseFloat(total_fee)});
		if(!bill) {
			return ctx.body = 'success';
		} else {
			if(bill.verify) {
				return ctx.body = 'success';
			} else {
				if(['TRADE_FINISHED', 'TRADE_SUCCESS'].includes(trade_status)) {
					bill.verify = true;
					bill.otherInfo = {
						transactionNumber: trade_no,
						account: buyer_email,
						paymentType: 'alipay'
					};
					await bill.save();
					return ctx.body = 'success';
				} else {
					bill.otherInfo.error = JSON.stringify(body);
					await bill.save();
				}
			}
		}
		await next();
	});
module.exports = donationRouter;
