const Router = require('koa-router');
const remindRouter = new Router();
remindRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {firstMessageId} = query;
    const {user} = data;
    const q = {
      ty: 'STU',
      r: user.uid
    };
    if(firstMessageId) {
      q._id = {
        $lt: firstMessageId
      }
    }
    // await db.MessageModel.updateMany({ty: 'STU', r: user.uid, vd: false}, {$set: {vd: true}});
    const remind = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
    const messages = await db.MessageModel.extendReminder(remind);
    data.messages = messages.reverse();
    await next();
  });
module.exports = remindRouter;