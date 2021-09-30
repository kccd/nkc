const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data, query} = ctx;
    let {fundId, money} = query;
    data.funds = await db.FundModel.find({
      display: true,
      disabled: false,
      history: false
    }, {name: 1, _id: 1}).sort({toc: 1});
    data.donation = data.fundSettings.donation;
    data.description = data.fundSettings.donationDescription;
    data.fundName = data.fundSettings.fundName;
    if(fundId) {
      const fund = await db.FundModel.findOne({_id: fundId}, {_id: 1});
      if(fund) data.fundId = fundId;
    }
    if(money) {
      money = Number(money);
      if(typeof money === 'number') {
        data.money = Math.round(money * 100) / 100;
      }
    }
    ctx.template = 'fund/donation/donation.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, data, body, state} = ctx;
    const {user} = data;
    const {
      money,
      fee,
      apiType,
      paymentType,
      fundId,
      anonymous,
      refund
    } = body;
    const fundSettings = await db.SettingModel.getSettings('fund');
    const {min, max, enabled, payment} = fundSettings.donation;
    if(!['aliPay', 'wechatPay'].includes(paymentType)) ctx.throw(400, `支付方式错误`);
    if(!enabled) ctx.throw(400, `赞助功能已关闭`);
    if(fee !== payment[paymentType].fee) ctx.throw(400, `页面数据过期，请刷新`);
    const totalMoney = Math.ceil(money * (1 + fee));
    if(isNaN(totalMoney)) ctx.throw(400, `支付金额错误，请刷新后再试`);
    if(totalMoney < min) ctx.throw(400, `最小赞助金额不能小于 ${min / 100} 元`);
    if(totalMoney > max) ctx.throw(400, `最大赞助金额不能大于 ${max / 100} 元`);
    if(fundId !== 'fundPool') {
      await db.FundModel.findOnly({_id: fundId});
    }
    let paymentId;
    const description = '基金赞助';
    if(paymentType === 'wechatPay') {
      if(!payment.wechatPay.enabled) ctx.throw(400, `微信支付已关闭`);
      const wechatPayRecord = await db.WechatPayRecordModel.getPaymentRecord({
        apiType,
        description,
        money: totalMoney,
        fee,
        effectiveMoney: money,
        uid: state.uid,
        attach: {},
        from: 'fund',
        clientIp: ctx.address,
        clientPort: ctx.port
      });
      paymentId = wechatPayRecord._id;
      data.wechatPaymentInfo = {
        paymentId,
        url: wechatPayRecord.url
      };
    } else if(paymentType === 'aliPay') {
      if(!payment.aliPay.enabled) ctx.throw(400, `支付宝支付已关闭`);
      const aliPayRecord = await db.AliPayRecordModel.getPaymentRecord({
        title: description,
        money: totalMoney,
        fee,
        effectiveMoney: money,
        uid: state.uid,
        from: 'fund',
        clientIp: ctx.address,
        clientPort: ctx.port
      });
      paymentId = aliPayRecord._id;
      data.aliPaymentInfo = {
        paymentId,
        url: aliPayRecord.url
      };
    }
    await db.FundBillModel.createDonationBill({
      money: money / 100,
      uid: user? user.uid: '',
      anonymous,
      fundId,
      paymentId,
      paymentType,
      refund,
    });
    await next();
  });
module.exports = router;

/*
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
*/
