const Router = require('koa-router');
const router = new Router();
const imageRouter = require('./image');
router
  .del('/:uid', async (ctx, next) => {
    const {data, db, params, redis} = ctx;
    const {user} = data;
    const {uid} = params;
    await db.FriendModel.removeFriend(user.uid, uid);
    /*const message = {
      ty: 'deleteFriend',
      deleterId: user.uid,
      deletedId: uid
    };
    await redis.pubMessage(message);*/
    await next();
  })
  .use('/:uid/image', imageRouter.routes(), imageRouter.allowedMethods());
module.exports = router;