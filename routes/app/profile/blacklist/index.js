const { Public } = require('../../../../middlewares/permission');

const router = require('koa-router')();
router.get('/', Public(), async (ctx, next) => {
  await next();
});
module.exports = router;
