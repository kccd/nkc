const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx, next) => {
  // 获取已经存在的草稿
  await next();
});
router.put('/', async (ctx, next) => {
  // 暂存草稿
  await next();
});
router.post('/', async (ctx, next) => {
  // 基于草稿提交
  await next();
});
module.exports = router;
