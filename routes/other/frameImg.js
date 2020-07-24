const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const path = require('path');
const {upload, statics, cache} = require('../../settings');
const {frameImgPath, uploadPath} = upload;
const {defaultVideoCoverPath} = statics;
const FILE = require('../../nkcModules/file');

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a tid is required.');
    await next()
  })
  .get('/:tid', async (ctx, next) => {
    const {db} = ctx;
    const {tid} = ctx.params;
    const {fs} = ctx;
    let rid = tid;
    const resource = await db.ResourceModel.findOnly({rid, type: "resource"});
    let dir = await FILE.getPath("mediaVideo", resource.toc);
    let filePath = `${dir}/${rid}_cover.jpg`;
    try {
      stat = await fs.stat(filePath);
    } catch(e) {
      filePath = defaultVideoCoverPath;
    } finally {
      ctx.type = 'jpg';
      ctx.filePath = filePath
    }
    await next()
    ctx.set('Cache-Control', 'no-cache');
  });

module.exports = router;