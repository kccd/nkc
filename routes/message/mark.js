const Router = require('koa-router');
const markRouter = new Router();
markRouter
  .patch('/', async(ctx, next) => {
    const {data, db, body} = ctx;
    const {type, uid} = body;
    const {user} = data;
    await db.MessageModel.markAsRead(type, user.uid, uid);
    await next();
  });
module.exports = markRouter;
