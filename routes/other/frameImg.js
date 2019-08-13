const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const path = require('path');
const {upload, statics, cache} = require('../../settings');
const {frameImgPath, uploadPath} = upload;
const {defaultVideoCoverPath} = statics;

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a tid is required.');
    await next()
  })
  .get('/:tid', async (ctx, next) => {
    const {tid} = ctx.params;
    const {fs} = ctx;
    let url = `${frameImgPath}/${tid}.jpg`;
    try {
      stat = await fs.stat(url);
    } catch(e) {
      url = defaultVideoCoverPath;
    } finally {
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
      ctx.type = 'jpg';
      ctx.filePath = url
    }
    await next()
  });

module.exports = router;