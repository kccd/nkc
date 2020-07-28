const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.cacheSettings = await db.SettingModel.getSettings("cache");
    data.cachePageCount = await db.CacheModel.count();
    ctx.template = "experimental/settings/cache/cache.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {body, db} = ctx;
    const {type, cache} = body;
    if(type === "modify") {
      let {
        visitorPageCacheTime,
        visitorPageCacheTimeout
      } = cache;
      visitorPageCacheTime = Number(visitorPageCacheTime);
      // visitorPageCacheTimeout = Number(visitorPageCacheTimeout);
      if(visitorPageCacheTime < 0) ctx.throw(400, "更新缓存时间不能小于0");
      // if(visitorPageCacheTimeout < 0) ctx.throw(400, "清除缓存时间不能小于0");
      await db.SettingModel.updateOne({_id: "cache"}, {
        $set: {
          "c.visitorPageCacheTime": visitorPageCacheTime,
          // "c.visitorPageCacheTimeout": visitorPageCacheTimeout
        }
      });
      await db.SettingModel.saveSettingsToRedis("cache");
    } else if(type === "clear") {
      await db.CacheModel.clearAllCache();
    }
    await next();
  });
module.exports = router;
