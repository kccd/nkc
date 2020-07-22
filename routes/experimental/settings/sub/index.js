const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const subSettings = await db.SettingModel.findById("subscribe");
    data.subSettings = subSettings.c;
    ctx.template = "experimental/settings/sub/sub.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body} = ctx;
    let {subUserCountLimit, subForumCountLimit, subThreadCountLimit} = body;
    subUserCountLimit = Math.round(Number(subUserCountLimit));
    subForumCountLimit = Math.round(Number(subForumCountLimit));
    subThreadCountLimit = Math.round(Number(subThreadCountLimit));
    if(subUserCountLimit < 0 || subForumCountLimit < 0 || subThreadCountLimit < 0)
      ctx.throw(400, "数量不能小于0");
    await db.SettingModel.updateOne({
      _id: "subscribe"
    }, {
      $set: {
        "c.subUserCountLimit": subUserCountLimit,
        "c.subForumCountLimit": subForumCountLimit,
        "c.subThreadCountLimit": subThreadCountLimit
      }
    });
    await db.SettingModel.saveSettingsToRedis("subscribe");
    await next();
  });
module.exports = router;
