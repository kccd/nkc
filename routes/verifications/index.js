const router = require("koa-router")();
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.verificationData = await db.VerificationModel.getVerificationData({
      uid: data.user? data.user.uid:'',
      ip: ctx.address,
      port: ctx.port,
    });
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {verificationData} = body;
    await db.VerificationModel.verifyData(verificationData);
    await next();
  });
module.exports = router;
