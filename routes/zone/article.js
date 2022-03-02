const router = require('koa-router')();
router
  .get('/:aid', async (ctx, next) => {
    await next();
  });
module.exports = router;