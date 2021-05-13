const router = require("koa-router")();
router
  .post("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {column} = data;
    const homeSettings = await db.SettingModel.getSettings("home");
    if(homeSettings.toppedColumnsId.includes(column._id)) ctx.throw(400, "专栏已经被推送到首页了");
    homeSettings.toppedColumnsId.unshift(column._id);
    await db.SettingModel.updateOne({_id: "home"}, {
      $set: {
        "c.toppedColumnsId": homeSettings.toppedColumnsId
      }
    });
    await db.SettingModel.saveSettingsToRedis("home");
    await next();
  })
  .del("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {column} = data;
    const homeSettings = await db.SettingModel.getSettings("home");
    if(!homeSettings.toppedColumnsId.includes(column._id)) ctx.throw(400, "专栏未被推送到首页");
    await db.SettingModel.updateOne({_id: "home"}, {
      $pull: {
        "c.toppedColumnsId": column._id
      }
    });
    await db.SettingModel.saveSettingsToRedis("home");
    await next();
  });
module.exports = router;