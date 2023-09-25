const Router = require('koa-router');
const router = new Router();

router
  .use('/', async (ctx, next) => {
    ctx.data.navbar_highlight = 'apps';
    await next();
  })
  .get('/', async (ctx, next) => {
    const { db, data } = ctx;
    data.appsData = await db.SettingModel.getAppsData();
    ctx.remoteTemplate = 'apps/index.pug';
    await next();
  });
module.exports = router;
