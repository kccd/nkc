const router = require("koa-router")();
const subRouter = require('./subscribe');
const financeRouter = require('./finance');
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.appsData = await db.SettingModel.getAppsData();
    await next();
  })
  .use('/', async (ctx, next) => {
    ctx.template = 'vueRoot/index.pug';
    await next();
  })
  .use('/sub', subRouter.routes(), subRouter.allowedMethods())
  .use('/finance', financeRouter.routes(), financeRouter.allowedMethods())
module.exports = router;
