const { Public } = require('../../middlewares/permission');

const router = require('koa-router')();
router
  .get('/', Public(), async (ctx, next) => {
    const { db, data, query } = ctx;
    let { fundId, money } = query;
    data.funds = await db.FundModel.find(
      {
        display: true,
        disabled: false,
        history: false,
      },
      { name: 1, _id: 1 },
    ).sort({ toc: 1 });
    data.donation = data.fundSettings.donation;
    data.description = data.fundSettings.donationDescription;
    data.fundName = data.fundSettings.fundName;
    if (fundId) {
      const fund = await db.FundModel.findOne({ _id: fundId }, { _id: 1 });
      if (fund) data.fundId = fundId;
    }
    if (money) {
      money = Number(money);
      if (typeof money === 'number') {
        data.money = Math.round(money * 100) / 100;
      }
    }
    ctx.template = 'fund/donation/donation.pug';
    await next();
  })
  .post('/', Public(), async (ctx, next) => {
    const { db, data, body, state } = ctx;
    const { user } = data;
    const { money, fee, apiType, paymentType, fundId, anonymous, refund } =
      body;
    const fundSettings = await db.SettingModel.getSettings('fund');
    const { min, max, enabled, payment } = fundSettings.donation;
    if (!['aliPay', 'wechatPay'].includes(paymentType))
      ctx.throw(400, `支付方式错误`);
    if (!enabled) ctx.throw(400, `赞助功能已关闭`);
    if (fee !== payment[paymentType].fee)
      ctx.throw(400, `页面数据过期，请刷新`);
    const totalMoney = Math.ceil(money * (1 - fee));
    if (isNaN(totalMoney)) ctx.throw(400, `支付金额错误，请刷新后再试`);
    if (money < min) ctx.throw(400, `最小支付金额不能小于 ${min / 100} 元`);
    if (money > max) ctx.throw(400, `最大支付金额不能大于 ${max / 100} 元`);
    if (fundId !== 'fundPool') {
      await db.FundModel.findOnly({ _id: fundId });
    }
    let paymentId;
    const description = '基金赞助';
    if (paymentType === 'wechatPay') {
      if (!payment.wechatPay.enabled) ctx.throw(400, `微信支付已关闭`);
      const wechatPayRecord = await db.WechatPayRecordModel.getPaymentRecord({
        apiType,
        description,
        money: money,
        fee,
        effectiveMoney: totalMoney,
        uid: state.uid,
        attach: {},
        from: 'fund',
        clientIp: ctx.address,
        clientPort: ctx.port,
      });
      paymentId = wechatPayRecord._id;
      data.wechatPaymentInfo = {
        paymentId,
        url: wechatPayRecord.url,
      };
    } else if (paymentType === 'aliPay') {
      if (!payment.aliPay.enabled) ctx.throw(400, `支付宝支付已关闭`);
      const aliPayRecord = await db.AliPayRecordModel.getPaymentRecord({
        title: description,
        money: money,
        fee,
        effectiveMoney: totalMoney,
        uid: state.uid,
        from: 'fund',
        clientIp: ctx.address,
        clientPort: ctx.port,
      });
      paymentId = aliPayRecord._id;
      data.aliPaymentInfo = {
        paymentId,
        url: aliPayRecord.url,
      };
    }
    await db.FundBillModel.createDonationBill({
      money: money / 100,
      uid: user ? user.uid : '',
      anonymous,
      fundId,
      paymentId,
      paymentType,
      refund,
    });
    await next();
  });
module.exports = router;
