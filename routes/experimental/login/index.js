const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db} = ctx;
    const safeSettings = await db.SettingModel.getSettings("safe");
    if(!safeSettings.experimentalVerifyPassword) return ctx.redirect('/e');
    ctx.template = "experimental/login/login.pug";
    await next();
  })
  .post("/", async (ctx, next) =>{
    const {db, data, body, nkcModules} = ctx;
    const {password} = body;
    const safeSettings = await db.SettingModel.getSettings("safe");
    if(!nkcModules.apiFunction.testPassword(password, "sha256HMAC", {
      salt: safeSettings.experimentalPassword.salt,
      hash: safeSettings.experimentalPassword.hash
    })) {
      ctx.throw(400, "密码错误");
    }
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: data.user.uid});
    ctx.setCookie("experimental", {
      uid: data.user.uid,
      p: userPersonal.secret,
      secret: safeSettings.experimentalPassword.secret,
      time: Date.now()
    });
    data.redirect = "/e/console";
    await next();
  });
module.exports = router;
