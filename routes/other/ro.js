const Router = require('koa-router');
const RoRouter = new Router();
const {upload, statics, cache} = require('../../settings');
const {defaultOriginPath} = statics;
const PATH = require("path");
RoRouter
  .get('/:originId', async (ctx, next) => {
    const {db, params} = ctx;
    const {originId} = params;
    const originImage = await db.OriginImageModel.findOnly({originId});
    ctx.remoteFile = await originImage.getRemoteFile();
    await next();
  });
module.exports = RoRouter;
