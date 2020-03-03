const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    data.regSettings = await db.SettingModel.getSettings("register");
    const {verifyEmail, verifyMobile, verifyPassword} = data.regSettings;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    data.verifyEmail = verifyEmail && userPersonal.email;
    data.verifyMobile = verifyMobile && userPersonal.mobile;
    data.verifyPassword = verifyPassword;
    ctx.template = "user/destroy/destroy.pug";
    await next();
  });
module.exports = router;