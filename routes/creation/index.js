const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    if(ctx.query.t) {
      ctx.template = 'creation/home.pug';
    } else {
      ctx.remoteTemplate = 'creation/home.pug';
    }
    await next();
  });
module.exports = router;