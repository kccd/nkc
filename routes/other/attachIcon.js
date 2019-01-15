const Router = require('koa-router');
const router = new Router();
const {statics, cache} = require('../../settings');
const {attachIconPath} = statics;
router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a filename is required.');
    await next()
  })
  .get('/:file', async (ctx, next) => {
    const {file} = ctx.params;
    const {fs} = ctx;
    let filePath = `${attachIconPath}/kc${file}`;
    try{
      await fs.access(filePath);
    }catch(e) {
      filePath = `${attachIconPath}/weizhi.png`
    }
    ctx.filePath = filePath;
    ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
    const [name, ext] = file;
    ctx.type = ext;
    await next()
  });

module.exports = router;