const Router = require('koa-router');
const RoRouter = new Router();
const {upload, statics, cache} = require('../../settings');
const {originPath} = upload;
const {defaultOriginPath} = statics;
RoRouter
  .get('/:originId', async (ctx, next) => {
    const {originId} = ctx.params;
    const {db, fs} = ctx;
    const targetResource = await db.OriginImageModel.findOnly({originId});
    const extension = targetResource.ext;
    const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp'];
    let url;
    if(extArr.includes(extension.toLowerCase()) && targetResource.tpath) {
      url = originPath + '/' + targetResource.tpath;
      try{
        await fs.access(url);
      } catch (e) {
        url = defaultOriginPath;
      }
    } else {
      url = defaultOriginPath;
    }
    ctx.filePath = url;
    ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
    ctx.type = extension;
    await next();
  });
module.exports = RoRouter;