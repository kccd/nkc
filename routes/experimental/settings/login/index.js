const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.loginSettings = await db.SettingModel.getSettings("login");
    ctx.template = "experimental/settings/login/login.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {checkNumber} = nkcModules.checkData;
    const {
      login, resetPassword
    } = body;
    checkNumber(login.ipCountLimit, {
      name: "登录IP次数限制",
      min: 0
    });
    checkNumber(login.usernameCountLimit, {
      name: "登录用户名次数限制",
      min: 0
    });
    checkNumber(login.mobileCountLimit, {
      name: "登录手机号次数限制",
      min: 0
    });
    checkNumber(resetPassword.ipCountLimit, {
      name: "找回密码IP次数限制",
      min: 0
    });
    checkNumber(resetPassword.usernameCountLimit, {
      name: "找回密码用户名次数限制",
      min: 0
    });
    checkNumber(resetPassword.mobileCountLimit, {
      name: "找回密码手机号次数限制",
      min: 0
    });
    checkNumber(resetPassword.emailCountLimit, {
      name: "找回密码邮箱次数限制",
      min: 0
    });
    await db.SettingModel.updateOne({_id: "login"}, {
      $set: {
        "c.login": login,
        "c.resetPassword": resetPassword
      }
    });
    await db.SettingModel.saveSettingsToRedis("login");
    await next();
  });
module.exports = router;
