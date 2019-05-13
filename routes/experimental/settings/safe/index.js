const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.safeSettings = (await db.SettingModel.findById("safe")).c;
    ctx.template = "experimental/settings/safe/safe.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {db, body} = ctx;
    const {safeSettings} = body;
    safeSettings.experimentalVerifyPassword = !!safeSettings.experimentalVerifyPassword;
    if(safeSettings.experimentalTimeout >= 5) {}
    else {
      ctx.throw(400, "后台密码过期时间不能小于5分钟");
    }
    await db.SettingModel.updateOne({_id: "safe"}, {
      $set: {
        "c.experimentalVerifyPassword": safeSettings.experimentalVerifyPassword,
        "c.experimentalTimeout": safeSettings.experimentalTimeout
      }
    });
    await next();
  });
module.exports = router;