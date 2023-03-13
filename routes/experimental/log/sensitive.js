const router = require('koa-router')();
router.get('/', async (ctx, next) => {
  const { db, query, nkcModules } = ctx;
  const { page = 0 } = query;
  await next();
});
module.exports = router;
