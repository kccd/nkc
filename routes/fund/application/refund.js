const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {data, state} = ctx;
    const {applicationForm} = data;
    if(state.uid !== applicationForm.uid) ctx.throw(403, `权限不足`);
    if(applicationForm.status.refund !== false) ctx.throw(400, `当前基金申请不需要退款`);
    await next();
  })
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const fundSettings = await db.SettingModel.getSettings('fund');
    data.donation = fundSettings.donation;
    ctx.template = 'fund/refund/refund.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, data, body, state} = ctx;
    const {applicationForm} = data;
    let {refundMoney, fundId} = applicationForm;
    refundMoney = refundMoney * 100;
    const {
      paymentType,
      apiType,
      fee,
    } = body;
    const {donation} = await db.SettingModel.getSettings('fund');
    if(!donation.enabled) {
      ctx.throw(400, `退款功能已关闭`);
    }
    const {payment} = donation;
    if(!['aliPay', 'wechatPay'].includes(paymentType)) ctx.throw(400, `支付方式错误`);
    if(fee !== payment[paymentType].fee) ctx.throw(400, `页面数据过期，请刷新`);
    const totalMoney = Math.ceil(refundMoney * (1 + fee));
    if(isNaN(totalMoney)) ctx.throw(400, `退款金额错误，请刷新后再试`);
    let paymentId;
    const description = `基金退款`;
    if(paymentType === 'wechatPay') {
      if(!payment.wechatPay.enabled) ctx.throw(400, `微信支付已关闭`);
      const wechatPayRecord = await db.WechatPayRecordModel.getPaymentRecord({
        apiType,
        description,
        money: totalMoney,
        fee,
        effectiveMoney: refundMoney,
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
    } else {
      if(!payment.aliPay.enabled) ctx.throw(400, `支付宝支付已关闭`);
      const aliPayRecord = await db.AliPayRecordModel.getPaymentRecord({
        title: description,
        money: totalMoney,
        fee,
        effectiveMoney: refundMoney,
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
    const bill = await db.FundBillModel.createRefundBill({
      money: refundMoney / 100,
      uid: state.uid,
      formId: applicationForm._id,
      fundId,
      paymentId,
      paymentType,
    });
    await applicationForm.saveRefundBillId(bill._id);
    await next();
  });
module.exports = router;