const router = require('koa-router')();
router
  .get('/:bid', async (ctx, next) => {
    await next();
  })
  .get('/:bid/settings', async (ctx, next) => {
    await next();
  });
module.exports = router;