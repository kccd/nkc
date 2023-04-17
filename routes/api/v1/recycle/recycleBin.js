const router = require('koa-router')();
router.get('/', async (ctx, next) => {
  ctx.apiData = {
    success: '成功了',
  };
  await next();
});
module.exports = router;
