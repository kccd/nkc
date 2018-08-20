const Router = require('koa-router');
const remindRouter = new Router();
remindRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {lastRemindId} = query;
    const {user} = data;
    const q = {
      ty: 'STU',
      r: user.uid
    };
    if(lastRemindId) {
      q._id = {
        $lt: lastRemindId
      }
    }
    data.remind = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
    await db.SocketModel.update({uid: user.uid, targetUid: {$ne: ''}}, {targetUid: ''});
    await next();
  });
module.exports = remindRouter;