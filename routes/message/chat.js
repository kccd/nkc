const Router = require('koa-router');
const chatRouter = new Router();
chatRouter
  .del('/:uid', async (ctx, next) => {
    const {data, params, db, redis} = ctx;
    const {user} = data;
    const {uid} = params;
    let type;
    let tUid;
    if(['STU', 'STE', 'newFriends'].includes(uid)) {
      type = uid;
    } else {
      type = 'UTU';
      tUid = uid;
    }
    await db.CreatedChatModel.removeChat(type, user.uid, tUid);
    /*await redis.pubMessage({
      ty: 'removeChat',
      deleterId: user.uid,
      deletedId: uid
    });*/
    await next();
  });
module.exports = chatRouter;