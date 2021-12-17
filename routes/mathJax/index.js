const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    ctx.remoteTemplate = 'mathJax/mathJax.pug';
    await next();
  })
module.exports = router;