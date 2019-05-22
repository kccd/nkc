const Router = require('koa-router');
const RmRouter = new Router();
const {upload, statics, cache} = require('../../settings');
const {mediumPath} = upload;
const {defaultMediumPath} = statics;
RmRouter
  .get('/:rid', async (ctx, next) => {
    const {rid} = ctx.params;
    const {db, fs} = ctx;
    const targetResource = await db.ResourceModel.findOnly({rid});
    const extension = targetResource.ext;
    const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp'];
    let url;
    if(extArr.includes(extension.toLowerCase()) && targetResource.tpath) {
      url = mediumPath + '/' + targetResource.tpath;
      try{
        await fs.access(url);
      } catch (e) {
        url = defaultMediumPath;
      }
    } else {
      url = defaultMediumPath;
    }
    ctx.filePath = url;
    ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
    ctx.type = extension;
    await next();
  });
module.exports = RmRouter;