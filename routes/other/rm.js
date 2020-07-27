const Router = require('koa-router');
const RmRouter = new Router();
const PATH = require('path');
RmRouter
  .get('/:rid', async (ctx, next) => {
    const {rid} = ctx.params;
    const {db, fs, nkcModules, settings} = ctx;
    const targetResource = await db.ResourceModel.findOnly({rid});
    const extension = targetResource.ext;
    const fileFolder = await nkcModules.file.getPath('mediaPicture', targetResource.toc);
    let url = PATH.resolve(fileFolder, `./${rid}_md.${extension}`);
    try{
      await fs.access(url);
    } catch (e) {
      url = settings.statics.defaultMediumPath;
    }
    ctx.filePath = url;
    ctx.type = extension;
    await next();
  });
module.exports = RmRouter;
