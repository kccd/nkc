const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {db, body, data, nkcModules} = ctx;
    const {code} = body;
    const {targetUser, user} = data;
    nkcModules.checkData.checkString(code, {
      name: '用户动态码',
      minLength: 1
    });
    const codes = await db.UserModel.getCode(targetUser.uid);
    const status = await db.UserModel.checkCode(targetUser.uid, code);
    const log = db.UsersCodeLogModel({
      uid: targetUser.uid,
      mUid: user.uid,
      ip: ctx.address,
      port: ctx.port,
      code: codes,
      mCode: code,
      status,
    });
    await log.save();
    if(!status) ctx.throw(400, `动态码无效`);
    await next();
  });
module.exports = router;




