const router = require('koa-router')();
const { Public } = require('../../middlewares/permission');
router.get('/web/viewer', Public(), async (ctx, next) => {
  const { db, query } = ctx;
  let { file } = query;
  let rid = '';
  try {
    rid = file.replace(/\?.*/gi, '');
    rid = rid.split('/');
    rid = rid[2];
  } catch (err) {
    ctx.throw(400, '权限不足');
  }

  const resource = await db.ResourceModel.findOnly({ rid });
  const { ext } = resource;
  if (ext !== 'pdf') {
    ctx.throw(400, '仅支持预览pdf文件');
  }
  // 不要把这次的响应结果缓存下来
  ctx.set('Cache-Control', 'no-store');
  ctx.template = 'reader/pdf/web/viewer.pug';
  await next();
});
module.exports = router;
