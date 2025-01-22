const { OnlyUnbannedUser, OnlyUser } = require('../../middlewares/permission');

const router = require('koa-router')();
router.get('/', OnlyUser(), async (ctx, next) => {
  ctx.template = 'columns/columnEditor.pug';
  await next();
});
module.exports = router;
