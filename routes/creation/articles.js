const router = require('koa-router')();
router
  .get('/creator', async (ctx, next) => {
    await next();
  });
module.exports = router;