const { OnlyUnbannedUser } = require('../../../../middlewares/permission');

const router = require('koa-router')();
router.get('/', OnlyUnbannedUser(), async (ctx, next) => {
  await next();
});
module.exports = router;
