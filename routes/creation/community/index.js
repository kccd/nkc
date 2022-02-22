const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .get('/thread', async (ctx, next) => {
    await next();
  })
  .get('/post', async (ctx, next) => {
    await next();
  })
  .get('/draft', async (ctx, next) => {
    await next();
  })
  .get('/note', async (ctx, next) => {
    await next();
  });
module.exports = router;