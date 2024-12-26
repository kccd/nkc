const Router = require('koa-router');
const router = new Router();
const { statics, cache } = require('../settings');
const { attachIconPath } = statics;
const { Public } = require('../middlewares/permission');
router.get('/:file', Public(), async (ctx, next) => {
  const { file } = ctx.params;
  const { fs } = ctx;
  let filePath = `${attachIconPath}/kc${file}.png`;
  try {
    await fs.access(filePath);
  } catch (e) {
    filePath = `${attachIconPath}/weizhi.png`;
  }
  ctx.filePath = filePath;
  ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
  ctx.type = 'png';
  await next();
});

module.exports = router;
