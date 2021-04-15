const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {db, body, state, data} = ctx;
    const {nationCode, phoneNumber} = body;
    const record = await db.VerificationRecordModel.verifyPhoneNumber({
      uid: state.uid,
      nationCode,
      phoneNumber,
      ip: ctx.address,
      port: ctx.port
    });
    data.recordId = record._id;
    await next();
  });
module.exports = router;