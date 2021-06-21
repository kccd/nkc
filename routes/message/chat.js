const Router = require('koa-router');
const chatRouter = new Router();
chatRouter
  .del('/', async (ctx, next) => {
    const {nkcModules, data, query, db} = ctx;
    const {user} = data;
    const {uid, type} = query;
    await db.CreatedChatModel.removeChat(type, user.uid, uid);
    await nkcModules.socket.sendEventRemoveChat(type, user.uid, uid);
    await next();
  });
module.exports = chatRouter;