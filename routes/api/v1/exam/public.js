const router = require('koa-router')();
router
  .get('/register', async (ctx, next) => {
    const { db } = ctx;
    const {
      c: { registerExamination },
    } = await db.SettingModel.findOnly({ _id: 'register' }, { c: 1 });
    ctx.apiData = {
      registerExamination,
    };
    await next();
  })
  .get('/paper/:pid', async (ctx, next) => {
    const {
      params: { pid },
    } = ctx;
  })
  .post('/result', async (ctx, next) => {
    ctx.apiData = {
      success: '成功了',
    };
    await next();
  });

module.exports = router;
