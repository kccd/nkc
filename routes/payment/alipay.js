const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    await next();
  });
module.exports = router;
