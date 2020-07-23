const Router = require('koa-router');
const RoRouter = new Router();
const {upload, statics, cache} = require('../../settings');
const {defaultOriginPath} = statics;
const PATH = require("path");
RoRouter
  .get('/:originId', async (ctx, next) => {
    const {originId} = ctx.params;
    const {db, fs} = ctx;
    const targetResource = await db.OriginImageModel.findOnly({originId});
    const extension = targetResource.ext;
    const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp'];
    let url;
    if(extArr.includes(extension.toLowerCase()) && targetResource.tpath) {
      const fileFolder = await db.ResourceModel.getMediaPath('mediaOrigin', targetResource.toc);
      url = PATH.resolve(fileFolder, `./${targetResource.originId}.${targetResource.ext}`);
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
