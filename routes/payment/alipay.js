const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {db, body} = ctx;
    const paymentRecord = await db.AliPayRecordModel.setRecordStatusByNotificationInfo(body);
    await next();
  });
module.exports = router;
