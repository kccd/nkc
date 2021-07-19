const router = require('koa-router')();
router
  .get('/:_id', async (ctx, next) => {
    const {db, params, data} = ctx;
    const {_id} = params;
    const aliPayRecord = await db.AliPayRecordModel.findOne({_id});
    data.record = {
      type: 'aliPay',
      from: aliPayRecord.from,
      status: aliPayRecord.status,
      recordId: aliPayRecord._id
    }
    ctx.template = 'payment/recordStatus.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body} = ctx;
    const aliPayRecord = await db.AliPayRecordModel.setRecordStatusByNotificationInfo(body);
    if(aliPayRecord.status === 'success') {
      return ctx.body = 'success';
    }
    await next();
  });
module.exports = router;
