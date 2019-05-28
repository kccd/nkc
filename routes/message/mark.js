const Router = require('koa-router');
const markRouter = new Router();
markRouter
  .patch('/', async(ctx, next) => {
    const {data, db, body, redis} = ctx;
    const {type, uid} = body;
    const {user} = data;
    if(type === "UTU") {
      await db.MessageModel.updateMany({
        ty: 'UTU',
        r: user.uid,
        s: uid,
        vd: false
      }, {
        $set: {
          vd: true
        }
      });
      await db.CreatedChatModel.updateMany({uid: user.uid, tUid: uid}, {$set: {unread: 0}});
    } else if(type === 'STE') {
      const allInfo = await db.MessageModel.find({ty: 'STE'}, {_id: 1});
      const allInfoLog = await db.SystemInfoLogModel.find({uid: user.uid}, {mid: 1});
      const allInfoId = [];
      const allInfoLogId = [];

      for(const o of allInfo) {
        allInfoId.push(o._id);
      }
      for(const o of allInfoLog) {
        allInfoLogId.push(o.mid);
      }
      for(const id of allInfoId) {
        if(!allInfoLogId.includes(id)) {
          const log = db.SystemInfoLogModel({
            uid: user.uid,
            mid: id
          });
          await log.save();
        }
      }
    } else {
      await db.MessageModel.updateMany({ty: type, r: user.uid, vd: false}, {$set: {vd: true}});
    }
    await redis.pubMessage({
      ty: 'markAsRead',
      messageType: type,
      uid: user.uid,
      targetUid: uid
    });
    await next();
  });
module.exports = markRouter;