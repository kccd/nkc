const Router = require('koa-router');
const rotateRouter = new Router();
const {upload, statics, cache} = require('../../settings');
const {mediumPath, thumbnailPath} = upload;
// const {defaultThumbnailPath} = statics;
rotateRouter
  .patch('/', async (ctx, next) => {
    const {body, data, db, fs, settings} = ctx;
    const { imageMagick } = ctx.tools;
    const {rid} = body;
    // 取出大中小三个图片的路径
    let largeImagePath, middleImagePath, smallImagePath;
    const {selectDiskCharacterDown} = settings.mediaPath;
    const targetResource = await db.ResourceModel.findOnly({rid});
    const { path, ext } = targetResource;
    largeImagePath = selectDiskCharacterDown(targetResource);
    largeImagePath = largeImagePath + path;
    const extension = targetResource.ext;
    const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp'];
    if(extArr.includes(extension.toLowerCase()) && targetResource.tpath) {
      middleImagePath = mediumPath + '/' + targetResource.tpath;
      smallImagePath = thumbnailPath + '/' + targetResource.tpath;
    }
    console.log(largeImagePath, middleImagePath, smallImagePath)
    await imageMagick.pictureRotate(largeImagePath)
    await imageMagick.pictureRotate(middleImagePath)
    await imageMagick.pictureRotate(smallImagePath)
    // if(extArr.includes(extension.toLowerCase()) && targetResource.tpath) {
    //   url = thumbnailPath + '/' + targetResource.tpath;
    //   try{
    //     await fs.access(url);
    //   } catch (e) {
    //     url = defaultThumbnailPath;
    //   }
    // } else {
    //   url = defaultThumbnailPath;
    // }
    // ctx.filePath = url;
    // ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
    // ctx.type = extension;
    await next();
  });
module.exports = rotateRouter;