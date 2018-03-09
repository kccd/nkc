const Router = require('koa-router');
const directAlipay = require('direct-alipay');
const params = require('../../settings/alipaySecret');
directAlipay.config(params);
const donationRouter = new Router();
donationRouter
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
		const {user} = data;
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
			total_fee: money,
			extend_param: `uid^${user?user.uid:'null'}|anonymous^${anonymous || 'false'}|fundId^${fundId || 'null'}`
		};
		// data.url = directAlipay.buildDirectPayURL(params);
		const obj = {
			is_success: 'T',
			extend_param: `uid^74185|anonymous^false|fundId`,
			out_trade_no: id
		};
		const queryString = require('querystring');
		data.url = '/fund/donation/return?'+queryString.stringify(obj);
		await next();
	})
	.get('/return', async (ctx, next) => {
		const {data, query} = ctx;
		const {is_success, extend_param, trade_status, out_trade_no} = query;
		if(is_success !== 'T') {
			ctx.throw(500, trade_status);
		}
		data.alipayReturn = true;
		const extendParamArr = extend_param.split('|');
		const extendParams = {};
		for(let e of extendParamArr) {
			const arr = e.split('^');
			extendParams[arr[0]] = arr[1];
		}
		data.extendParam = extendParams;
		data.billId = out_trade_no;
		ctx.template = 'interface_fund_donation.pug';
		await next();
	});
module.exports = donationRouter;
