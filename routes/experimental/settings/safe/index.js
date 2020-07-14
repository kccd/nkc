const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.safeSettings = (await db.SettingModel.findById("safe")).c;
    data.safeSettings.hasPassword = !!data.safeSettings.experimentalPassword.hash;
    delete data.safeSettings.experimentalPassword;
    ctx.template = "experimental/settings/safe/safe.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {safeSettings, password} = body;
    safeSettings.experimentalVerifyPassword = !!safeSettings.experimentalVerifyPassword;
    if(safeSettings.experimentalTimeout >= 5) {}
    else {
      ctx.throw(400, "后台密码过期时间不能小于5分钟");
    }
    const obj = {
      "c.experimentalVerifyPassword": safeSettings.experimentalVerifyPassword,
      "c.experimentalTimeout": safeSettings.experimentalTimeout
    };
    const _ss = await db.SettingModel.getSettings('safe');
    if(!_ss.experimentalPassword.hash && !password && safeSettings.experimentalVerifyPassword) ctx.throw(400, '请设置后台密码');
    if(password) {
      const passwordObj = nkcModules.apiFunction.newPasswordObject(password);
      obj['c.experimentalPassword'] = {
        hash: passwordObj.password.hash,
        salt: passwordObj.password.salt,
        secret: passwordObj.secret
      }
    }
    await db.SettingModel.updateOne({_id: "safe"}, {
      $set: obj
    });
    await db.SettingModel.saveSettingsToRedis("safe");
    await next();
  });
module.exports = router;
