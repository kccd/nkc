const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.cacheSettings = await db.SettingModel.getSettings("cache");
    ctx.template = "experimental/settings/cache/cache.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {body, db} = ctx;
    const {type, cache} = body;
    if(type === "modify") {
      let {visitorPageCacheTime} = cache;
      visitorPageCacheTime = Number(visitorPageCacheTime);
      if(visitorPageCacheTime < 0) ctx.throw(400, "缓存时间不能小于0");
      await db.SettingModel.updateOne({_id: "cache"}, {
        $set: {
          "c.visitorPageCacheTime": visitorPageCacheTime
        }
      });
      await db.SettingModel.saveSettingsToRedis("cache");
    } else if(type === "clear") {
      await ctx.redis.cacheForums();
    }
    await next();
  });
module.exports = router;