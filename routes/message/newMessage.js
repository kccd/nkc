const Router = require('koa-router');

const router = new Router();

router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const {target, uid} = query;
    if(!target) ctx.throw(400, '参数错误');
    if(uid) data.targetUser = await db.UserModel.findOnly({uid});
    data.target = target;
    let messages = [];
    const {newSystemInfoCount, newReminderCount, newUsersMessagesCount} = user;
    if(target === 'notice' && newSystemInfoCount !== 0) {
      const allLogs = await db.SystemInfoLogModel.find({uid: user.uid});
      const systemInfoId = allLogs.map(l => l.mid);
      messages = await db.MessageModel.find({ty: 'STE', _id: {$nin: systemInfoId}}).sort({tc: 1});
    }
    if(target === 'reminder' && newReminderCount !== 0) {
      const remind = await db.MessageModel.find({ty: 'STU', r: user.uid, vd: false}).sort({tc: 1});
      const newRemind = await db.MessageModel.extendReminder(remind);
      messages = messages.concat(newRemind);
    }
    if(target === 'user' && uid && newUsersMessagesCount !== 0) {
      const userMessages = await db.MessageModel.find({ty: 'UTU', s: uid, r: user.uid, vd: false});
      for(const m of userMessages) {
        messages.push(m);
      }
    }
    data.messages = messages;
    await next();
  });

module.exports = router;