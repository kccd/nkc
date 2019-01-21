const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
const path = require('path');
const {upload, statics, cache, mediaPath} = require('../../settings');
const {coverPath, uploadPath, frameImgPath} = upload;
const {selectDiskCharacterDown} = mediaPath;

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
    let url = `${coverPath}/${tid}.jpg`;
    try {
      stat = await fs.stat(url);
    } catch(e) {
      const thread = await ThreadModel.findOnly({tid});
      await thread.extendFirstPost();
      await thread.firstPost.extendResources();
      const cover = thread.firstPost.resources.find(e => ['jpg', 'jpeg', 'bmp', 'png', 'svg', 'mp4'].indexOf(e.ext.toLowerCase()) > -1);
      if(cover) {
        const middlePath = selectDiskCharacterDown(cover);
        let coverMiddlePath;
        if(cover.ext === "mp4"){
          coverMiddlePath = path.join(path.resolve(frameImgPath), `/${cover.rid}.jpg`);
        }else{
          coverMiddlePath = path.join(middlePath, cover.path);
        }
        let coverExists = await fs.exists(coverMiddlePath);
        if(!coverExists){
          thread.hasCover = false;
          await thread.save();
          url = `${coverPath}/default.jpg`;
        }else{
          await coverify(coverMiddlePath, `${coverPath}/${tid}.jpg`)
          .catch(e => {
            thread.hasCover = false;
            return thread.save()
          });
        }
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
    console.log(ctx.filePath)
    await next()
  });

module.exports = router;