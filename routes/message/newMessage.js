const Router = require('koa-router');

const router = new Router();

router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const {target, uid, lastMessageId} = query;
    if(!target) ctx.throw(400, '参数错误');
    if(uid) data.targetUser = await db.UserModel.findOnly({uid});
    data.target = target;
    let messages = [];
    const {newSystemInfoCount, newReminderCount, newUsersMessagesCount} = user;
    if(target === 'STE' && newSystemInfoCount !== 0) {
      const allLogs = await db.SystemInfoLogModel.find({uid: user.uid});
      const systemInfoId = allLogs.map(l => l.mid);
      messages = await db.MessageModel.find({ty: 'STE', _id: {$nin: systemInfoId}}).sort({tc: 1});
    }
    if(target === 'STU' && newReminderCount !== 0) {
      const remind = await db.MessageModel.find({ty: 'STU', r: user.uid, vd: false}).sort({tc: 1});
      const newRemind = await db.MessageModel.extendSTUMessages(remind);
      messages = messages.concat(newRemind);
    }
    if(target === 'UTU' && uid && newUsersMessagesCount !== 0) {
      const q = {
        ty: 'UTU',
        $or: [
          {
            s: uid,
            r: user.uid
          },
          {
            s: user.uid,
            r: uid
          }
        ]
      };
      if(lastMessageId) {
        q._id = {$gt: lastMessageId};
      }
      const userMessages = await db.MessageModel.find(q);
      for(const m of userMessages) {
        messages.push(m);
      }
    }
    data.messages = messages;
    await next();
  });

module.exports = router;