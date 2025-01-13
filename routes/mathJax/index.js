const router = require('koa-router')();
const { Public, OnlyUser } = require('../../middlewares/permission');
router.get('/', OnlyUser(), async (ctx, next) => {
  ctx.remoteTemplate = 'mathJax/mathJax.pug';
  await next();
});
module.exports = router;
