const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    ctx.template = 'pim/index.pug';
    await next();
  });
module.exports = router;