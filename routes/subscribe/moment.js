const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    ctx.template = 'subscribe/moment.pug';
    await next();
  });
module.exports = router;