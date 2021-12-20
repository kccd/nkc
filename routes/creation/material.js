const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.material = null;
    await next();
  })
  .get('/', async (ctx, next) => {
    // 打开文件夹或素材
    await next();
  })
  .patch('/', async (ctx, next) => {
    // 修改文件夹或素材
    await next();
  })
  .del('/', async (ctx, next) => {
    // 删除文件夹或素材
    await next();
  });
module.exports = router;