const router = require('koa-router')();
router
  .get('/user', async (ctx, next) => {
    await next();
  })
  .get('/forum', async (ctx, next) => {
    await next();
  })
  .get('/column', async (ctx, next) => {
    await next();
  })
  .get('/thread', async (ctx, next) => {
    await next();
  })
  .get('/fan', async (ctx, next) => {
    await next();
  })
  .get('/follower', async (ctx, next) => {
    await next();
  })
  .get('/collection', async (ctx, next) => {
    await next();
  });
module.exports = router;
