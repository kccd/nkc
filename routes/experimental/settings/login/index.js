const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.loginSettings = await db.SettingModel.getSettings("login");
    ctx.template = "experimental/settings/login/login.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {db, body} = ctx;
    let {maxLoginCountOneHour} = body;
    maxLoginCountOneHour = parseInt(maxLoginCountOneHour);
    if(maxLoginCountOneHour < 1) ctx.throw(400, "最大尝试登录次数不能小于1");
    await db.SettingModel.updateOne({_id: "login"}, {
      $set: {
        "c.maxLoginCountOneHour": maxLoginCountOneHour
      }
    });
    await db.SettingModel.saveSettingsToRedis("login");
    await next();
  });
module.exports = router;