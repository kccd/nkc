const Router = require('koa-router');
const router = new Router();
const imageRouter = require('./image');
router
  .del('/:uid', async (ctx, next) => {
    const {data, db, params, redis} = ctx;
    const {user} = data;
    const {uid} = params;
    const q1 = {
      uid: user.uid,
      tUid: uid
    };
    const q2 = {
      uid: uid,
      tUid: user.uid
    };
    const friend = await db.FriendModel.findOne(q1);
    const targetFriend = await db.FriendModel.findOne(q2);
    if(!friend && !targetFriend) ctx.throw(400, '该用户暂未与您建立好友关系');
    await friend.deleteOne();
    await targetFriend.deleteOne();
    const chat = await db.CreatedChatModel.findOne(q1);
    const targetChat = await db.CreatedChatModel.findOne(q2);
    if(chat) await chat.deleteOne();
    if(targetChat) await targetChat.deleteOne();
    const message = {
      ty: 'deleteFriend',
      deleterId: user.uid,
      deletedId: uid
    };
    await redis.pubMessage(message);
    await next();
  })
  .use('/:uid/image', imageRouter.routes(), imageRouter.allowedMethods());
module.exports = router;