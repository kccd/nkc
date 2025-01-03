const { OnlyUser } = require('../../middlewares/permission');

const router = require('koa-router')();
router.get('/', OnlyUser(), async (ctx, next) => {
  await next();
});

module.exports = router;
