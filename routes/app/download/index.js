const { OnlyUnbannedUser } = require('../../../middlewares/permission');

const router = require('koa-router')();
router.get('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { state, nkcModules } = ctx;
  ctx.template = 'app/download/download.pug';
  await next();
});
module.exports = router;
