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
  .get('/zone/moment', async (ctx, next) => {
    await next();
  })
  .get("/zone/article", async (ctx, next) => {
    await next();
  })
  .get('/book', async (ctx, next) => {
    await next();
  })
  .get('/draft', async (ctx, next) => {
    await next();
  });
module.exports = router;
