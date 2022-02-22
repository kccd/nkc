const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .get('/article', async (ctx, next) => {
    await next();
  })
  .get('/draft', async (ctx, next) => {
    await next();
  });
module.exports = router;