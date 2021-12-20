const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    // 打开素材管理主页
    await next();
  })
  .post('/', async (ctx, next) => {
    // 创建文件夹或素材
    await next();
  })
module.exports = router;