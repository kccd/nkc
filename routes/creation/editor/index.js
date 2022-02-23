const router = require('koa-router')();
router
  .get('/column', async (ctx, next) => {
    await next();
  })
  .get('/community', async (ctx, next) => {
    await next();
  })
  .get('/zone', async (ctx, next) => {
    await next();
  })
  .get('/book', async (ctx, next) => {
    await next();
  })
module.exports = router;