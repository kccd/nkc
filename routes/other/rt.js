const Router = require('koa-router');
const RtRouter = new Router();
const {upload, statics} = require('../../settings');
const {thumbnailPath} = upload;
const {defaultThumbnailPath} = statics;
RtRouter
  .get('/:rid', async (ctx, next) => {
    const {rid} = ctx.params;
    const {db, fs} = ctx;
    const targetResource = await db.ResourceModel.findOnly({rid});
    const extension = targetResource.ext;
    const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp'];
    let url;
    if(extArr.includes(extension) && targetResource.tpath) {
      url = thumbnailPath + '/' + targetResource.tpath;
      try{
        await fs.access(url);
      } catch (e) {
        url = defaultThumbnailPath;
      }
    } else {
      url = defaultThumbnailPath;
    }
    ctx.filePath = url;
    await next();
  });
module.exports = RtRouter;