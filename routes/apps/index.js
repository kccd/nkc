const Router = require('koa-router');
const router = new Router();
const { appsService } = require('../../services/apps/apps.service');

router
  .get('/', async (ctx, next) => {
    const { data } = ctx;
    data.appsData = await appsService.getApps();
    ctx.remoteTemplate = 'apps/index.pug';
    await next();
  });
module.exports = router;
