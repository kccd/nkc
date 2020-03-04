const router = require("koa-router")();
router
  .use("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    data.regSettings = await db.SettingModel.getSettings("register");
    const {verifyEmail, verifyMobile, verifyPassword} = data.regSettings;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    data.verifyEmail = verifyEmail && userPersonal.email;
    data.verifyMobile = verifyMobile && userPersonal.mobile;
    data.verifyPassword = verifyPassword && !!userPersonal.hashType;
    if(data.verifyMobile) {
      data.mobile = "+" + userPersonal.nationCode + " " + userPersonal.mobile.slice(0, 3) + "****" + userPersonal.mobile.slice(7);
    }
    if(data.verifyEmail) {
      data.email = userPersonal.email.replace(/.{4}@/ig, "****@");
    }
    await next();
  })
  .get("/", async (ctx, next) => {
    ctx.template = "user/destroy/destroy.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, data, body} = ctx;
    const {type, form} = body;
    const {user} = data;
    const {verifyEmail, verifyMobile, verifyPassword} = data;
    const {
      emailCode,
      mobileCode,
      password
    } = form;
    const usersPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});

    let mobileCodeObj, emailCodeObj;
    if(verifyPassword) {
      if(!password) ctx.throw(400, "登录密码不能为空");
      await usersPersonal.ensurePassword(password);
    }
    if(verifyMobile) {
      mobileCodeObj = await db.SmsCodeModel.ensureCode({
        type: "destroy",
        mobile: usersPersonal.mobile,
        nationCode: usersPersonal.nationCode,
        code: mobileCode
      });
    }
    if(verifyEmail) {
      emailCodeObj = await db.EmailCodeModel.ensureEmailCode({
        type: "destroy",
        email: usersPersonal.email,
        token: emailCode
      });
    }
    if(type === "destroy") {
      if(mobileCodeObj) await mobileCodeObj.update({used: true});
      if(emailCodeObj) await mobileCodeObj.update({used: true});
      await db.UserModel.destroyAccount({
        uid: user.uid,
        ip: ctx.address,
        port: ctx.port
      });
      ctx.setCookie("userInfo", "");
    }
    await next();
  });
module.exports = router;