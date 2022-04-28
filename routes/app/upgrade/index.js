const router = require('koa-router')();
router.
  get('/', async (ctx, next) => {
    const {data, query, db} = ctx;
    const {version, platform} = query;
    data.stableAppData = null;
    data.currentAppData = null;
    const currentApp = await db.AppVersionModel.getAppByVersion(version, platform);
    const stableApp = await db.AppVersionModel.getStableApp(platform);
    if(currentApp) {
      data.currentAppData = await currentApp.extendAppData();
    }
    if(stableApp) {
      data.stableAppData = await stableApp.extendAppData();
    }
    await next();
  });
module.exports = router;
