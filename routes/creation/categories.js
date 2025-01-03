const { OnlyUser } = require('../../middlewares/permission');

const router = require('koa-router')();
router.get('/', OnlyUser(), async (ctx, next) => {
  const { data, db, state } = ctx;
  ctx.remoteTemplate = 'vueRoot/index.pug';
  await next();
});
module.exports = router;
