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
    await db.MessageModel.updateMany({ty: 'STU', r: user.uid, vd: false}, {$set: {vd: true}});
    const remind = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
    data.remind = await db.MessageModel.extendReminder(remind);
    db.MessageModel.setTargetUid(user.uid, '');
    await next();
  });
module.exports = remindRouter;