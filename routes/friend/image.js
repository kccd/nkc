const Router = require('koa-router');
const imageRouter = new Router();
imageRouter.get('/', async (ctx, next) => {
  const { data, db, params, settings } = ctx;
  const { uid } = params;
  const { user } = data;
  const friend = await db.FriendModel.findOne({ uid: user.uid, tUid: uid });
  if (!friend) {
    ctx.throw(403, '该用户不是你的联系人，无权查看');
  }
  if (!friend.info.image) {
    ctx.throw(404, '暂未上传图片');
  }
  const { friendImagePath } = settings.upload;
  ctx.filePath = friendImagePath + '/' + user.uid + '/' + uid + '.jpg';
  ctx.set('Cache-Control', 'public, no-cache');
  await next();
});
module.exports = imageRouter;
