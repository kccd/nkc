const Router = require('koa-router');
const RoRouter = new Router();
const {upload, statics, cache} = require('../../settings');
const {defaultOriginPath} = statics;
const PATH = require("path");
RoRouter
  .get('/:originId', async (ctx, next) => {
    const {originId} = ctx.params;
    const {db, fs, settings, nkcModules} = ctx;
    const targetResource = await db.OriginImageModel.findOnly({originId});
    const extension = targetResource.ext;
    const fileFolder = await nkcModules.file.getPath('mediaOrigin', targetResource.toc);
    let url = PATH.resolve(fileFolder, `./${targetResource.originId}.${extension}`);
    try{
      await fs.access(url);
    } catch (e) {
      url = defaultOriginPath;
    }
    ctx.filePath = url;
    ctx.type = extension;
    await next();
  });
module.exports = RoRouter;
