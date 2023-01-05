const router = require('koa-router')();
router
  .get('/info', async (ctx, next) => {
    const {db} = ctx;
    const serverInfo = await db.SettingModel.getSettings('server');
    ctx.apiData = {
      serverInfo: {
        ...serverInfo,
        icon: ctx.state.logoICO,
      }
    };
    await next();
  });
module.exports = router;
