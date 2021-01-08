const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data, params} = ctx;
    data.selected = "security";
    const {uid} = params;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid});
    data.havePassword = true;
    const {hash, salt} = userPersonal.password;
    if(!hash || !salt) data.havePassword = false;
    let {mobile, nationCode, email, unverifiedEmail, unverifiedMobile} = userPersonal;
    if(mobile) mobile = mobile.slice(0, 3) + "****" + mobile.slice(7);
    if(email) email = email.replace(/.{4}@/ig, "****@");
    data.mobile = mobile;
    data.userEmail = email;
    data.nationCode = nationCode;
    data.unverifiedEmail = unverifiedEmail;
    data.unverifiedMobile = unverifiedMobile;
    // 是否需要验证手机号
    data.needPhoneVerify = await db.UsersPersonalModel.shouldVerifyPhoneNumber(uid);
    ctx.template = "user/settings/security/security.pug";
    await next();
  });
module.exports = router;
