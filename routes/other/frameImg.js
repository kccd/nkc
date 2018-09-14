const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const path = require('path');
const {upload, statics, cache} = require('../../settings');
const {frameImgPath, uploadPath} = upload;

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a tid is required.');
    await next()
  })
  .get('/:tid', async (ctx, next) => {
    const {tid} = ctx.params;
    const {fs, db, tools} = ctx;
    const {coverify} = tools.imageMagick;
    const {ThreadModel} = db;
    let stat;
    let url = `${frameImgPath}/${tid}.jpg`;
    try {
      stat = await fs.stat(url);
    } catch(e) {
      const thread = await ThreadModel.findOnly({tid});
      await thread.extendFirstPost();
      await thread.firstPost.extendResources();
      const cover = thread.firstPost.resources.find(e => ['jpg', 'jpeg', 'bmp', 'png', 'svg'].indexOf(e.ext.toLowerCase()) > -1);
      if(cover) {
        await coverify(path.join(uploadPath, cover.path), `${coverPath}/${tid}.jpg`)
          .catch(e => {
            thread.hasCover = false;
            return thread.save()
          });
      } else {
        thread.hasCover = false;
        await thread.save();
        url = `${coverPath}/default.jpg`;
      }
    } finally {
      ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
      ctx.type = 'jpg';
      ctx.filePath = url
    }
    await next()
  });

module.exports = router;