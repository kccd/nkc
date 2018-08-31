const Router = require('koa-router');
const systemInfoRouter = new Router();
systemInfoRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const {lastSystemInfoId} = query;
    const q = {
      ty: 'STE'
    };
    if(lastSystemInfoId) {
      q._id = {
        $lt: lastSystemInfoId
      };
    }
    data.systemInfo = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
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
    db.MessageModel.setTargetUid(user.uid, '');
    await next();
  });
module.exports = systemInfoRouter;