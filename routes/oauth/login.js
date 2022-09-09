const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    ctx.remoteTemplate = 'oauth/login/login.pug';
    await next();
  });
module.exports = router;
