const router = require('koa-router')();
const {
  Public,
  OnlyUnbannedUser,
  OnlyUser,
} = require('../../middlewares/permission');
router
  .get('/:_id', OnlyUser(), async (ctx, next) => {
    const { db, params, data } = ctx;
    const { _id } = params;
    const aliPayRecord = await db.AliPayRecordModel.findOne({ _id });
    data.record = {
      type: 'aliPay',
      from: aliPayRecord.from,
      status: aliPayRecord.status,
      recordId: aliPayRecord._id,
    };
    ctx.template = 'payment/recordStatus.pug';
    await next();
  })
  .post('/', Public(), async (ctx, next) => {
    const { db, body } = ctx;
    const aliPayRecord =
      await db.AliPayRecordModel.setRecordStatusByNotificationInfo(body);
    if (aliPayRecord.status === 'success') {
      return (ctx.body = 'success');
    }
    await next();
  });
module.exports = router;
