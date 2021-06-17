const Router = require('koa-router');
const chatRouter = new Router();
chatRouter
  .del('/', async (ctx, next) => {
    const {nkcModules, data, query, db} = ctx;
    const {user} = data;
    const {uid} = query;
    let type;
    let tUid;
    if(['STU', 'STE', 'newFriends'].includes(uid)) {
      type = uid;
    } else {
      type = 'UTU';
      tUid = uid;
    }
    await db.CreatedChatModel.removeChat(type, user.uid, tUid);
    await nkcModules.socket.sendEventRemoveChat(type, user.uid, tUid);
    await next();
  });
module.exports = chatRouter;