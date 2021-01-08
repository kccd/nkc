const Router = require('koa-router');
const router = new Router();
const countdownLen = 60;  // 验证码发送间隔时间

router
  .get("/", async (ctx, next) => {
    const { data, db } = ctx;
    const { user } = data;
    if(!user) ctx.throw(403, "你还未登录");
    const userPersonal = await db.UsersPersonalModel.findOne({ uid: user.uid });
    if(userPersonal.getAuthLevel() < 1) ctx.throw(403, "你还未绑定手机号");
    const { nationCode, mobile } = userPersonal;
    data.phone = `+${nationCode || 86} ${mobile.substring(0, 3)}****${mobile.substring(7)}`;
    ctx.template = "user/phoneVerify/phoneVerify.pug";
		return next();
  })
  .post("/", async (ctx, next) => {
    const { data, body, db } = ctx;
    const { user } = data;
    const { code } = body;
    const {nationCode, number} = await db.UsersPersonalModel.getUserPhoneNumber(user.uid);
    const smsObj = {
      nationCode,
      mobile: number,
      code,
      type: 'verifyPhoneNumber'
    };
    const smsCode = await db.SmsCodeModel.ensureCode(smsObj);
    // 标记验证码为已使用
    await smsCode.mark();
    await db.UsersPersonalModel.modifyVerifyPhoneNumberTime(user.uid);
    return next();
  })
  .post("/sendSmsCode", async (ctx, next) => {
    const { nkcModules, data, db } = ctx;
    const { user } = data;
    if(!user) ctx.throw(403, "你还未登录");
    const authLevel = await db.UsersPersonalModel.getUserAuthLevel(user.uid);
    if(authLevel < 1) ctx.throw(403, "你还未绑定手机号");
    const {number, nationCode} = await db.UsersPersonalModel.getUserPhoneNumber(user.uid);
    const smsCodeObj = {
			nationCode,
			mobile: number,
			type: "verifyPhoneNumber",
      ip: ctx.address,
		};
		await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
    smsCodeObj.code = nkcModules.apiFunction.random(6);
    smsCodeObj.description = '验证手机号';

    const smsCode = db.SmsCodeModel(smsCodeObj);
		await smsCode.save();
		await nkcModules.sendMessage(smsCodeObj);
    data.countdownLen = countdownLen;
    return next();
  });

module.exports = router;