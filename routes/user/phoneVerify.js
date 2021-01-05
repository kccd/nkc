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
    const userPersonal = await db.UsersPersonalModel.findOne({ uid: user.uid });
    let { mobile, nationCode } = userPersonal;
    const smsCode = await db.SmsCodeModel
      .findOne({
        code,
        mobile,
        nationCode,
        toc: {
          $gte: new Date(Date.now() - countdownLen * 1000)
        }
      })
      .sort({toc: -1});
    if(!smsCode) ctx.throw(403, "验证码不正确或已过期");
    await smsCode.update({ $set: { used: true } });
    await userPersonal.update({
      $set: {
        lastVerifyPhoneNumberTime: new Date()
      }
    })
    return next();
  })
  .post("/sendSmsCode", async (ctx, next) => {
    const { nkcModules, data, db } = ctx;
    const { user } = data;
    const { apiFunction, sendMessage } = nkcModules;
    if(!user) ctx.throw(403, "你还未登录");
    const userPersonal = await db.UsersPersonalModel.findOne({ uid: user.uid });
    let { mobile, nationCode } = userPersonal;
    if(userPersonal.getAuthLevel() < 1) ctx.throw(403, "你还未绑定手机号");
    const smsCodeObj = {
			nationCode: nationCode || "86",
		  mobile,
      type: "login",
      code: apiFunction.random(6),
      ip: ctx.address
    };
    await db.SmsCodeModel(smsCodeObj).save();
    await sendMessage(smsCodeObj);
    data.countdownLen = countdownLen;
    return next();
  });

module.exports = router;