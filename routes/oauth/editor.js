const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    ctx.remoteTemplate = 'oauth/editor/editor.pug';
    await next();
  });
module.exports = router;
