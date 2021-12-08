const router = require('koa-router')();
router.get('/', async (ctx, next) => {
  ctx.remoteTemplate = 'creation/material.pug';
  await next();
});
module.exports = router;