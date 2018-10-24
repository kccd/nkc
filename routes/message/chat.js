const Router = require('koa-router');
const chatRouter = new Router();
chatRouter
  .del('/:uid', async (ctx, next) => {
    const {data, params, db, redis} = ctx;
    const {user} = data;
    const {uid} = params;
    if(uid === 'STU') {
      await db.MessageModel.updateMany({ty: 'STU', r: user.uid, vd: false}, {$set: {vd: true}});
      await db.UsersGeneralModel.update({uid: user.uid}, {$set: {'messageSettings.chat.reminder': false}});
    } else if(uid === 'STE') {
      const systemInfo = await db.MessageModel.find({ty: 'STE'}, {_id: 1});
      for(const s of systemInfo) {
        const log = await db.SystemInfoLogModel.findOne({uid: user.uid, mid: s._id});
        if(!log) {
          const newLog = await db.SystemInfoLogModel({
            mid: s._id,
            uid: user.uid
          });
          await newLog.save();
        }
      }
      await db.UsersGeneralModel.update({uid: user.uid}, {$set: {'messageSettings.chat.systemInfo': false}});
    } else if(uid === 'newFriends') {
      const applicationCount = await db.FriendsApplicationModel.count({respondentId: user.uid, agree: null});
      if(applicationCount > 0) ctx.throw(400, '您还有未处理的好友添加申请');
      await db.UsersGeneralModel.update({uid: user.uid}, {$set: {'messageSettings.chat.newFriends': false}});
    } else {
      const chat = await db.CreatedChatModel.findOne({uid: user.uid, tUid: uid});
      if(!chat) ctx.throw(404, '您暂未与该用户创建聊天');
      await chat.remove();
      await db.MessageModel.updateMany({ty: 'UTU', s: uid, r: user.uid, vd: false}, {$set: {vd: true}});
    }
    await redis.pubMessage({
      ty: 'removeChat',
      deleterId: user.uid,
      deletedId: uid
    });
    await next();
  });
module.exports = chatRouter;