const { OnlyUnbannedUser } = require('../../middlewares/permission');

const router = require('koa-router')();
router.get('/', OnlyUnbannedUser(), async (ctx, next) => {
  ctx.template = 'columns/columnEditor.pug';
  await next();
});
module.exports = router;
