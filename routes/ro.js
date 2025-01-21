const Router = require('koa-router');
const RoRouter = new Router();
const { upload, statics, cache } = require('../settings');
const { defaultOriginPath } = statics;
const PATH = require('path');
const { OnlyUnbannedUser } = require('../middlewares/permission');
RoRouter.get('/:originId', OnlyUnbannedUser(), async (ctx, next) => {
  const { db, params, state } = ctx;
  const { originId } = params;
  const originImage = await db.OriginImageModel.findOnly({
    originId,
  });
  if (originImage.uid !== state.uid) {
    ctx.throw(403, '权限不足');
  }
  ctx.remoteFile = await originImage.getRemoteFile();
  await next();
});
module.exports = RoRouter;
