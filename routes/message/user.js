const Router = require('koa-router');
const userRouter = new Router();
userRouter
  .get('/:uid', async (ctx, next) => {
    const {data, db, query, params} = ctx;
    const {uid} = params;
    const {user} = data;
    const {firstMessageId} = query;
    const targetUser = await db.UserModel.findOnly({uid});
    const q = {
      $or: [
        {
          r: user.uid,
          s: uid
        },
        {
          r: uid,
          s: user.uid
        }
      ]
    };
    if(firstMessageId) {
      q._id = {$lt: firstMessageId};
    }

    const messages = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
    messages.map(m => {
      if(m.withdrawn) m.c = '';
    });
    data.messages = messages.reverse();
    data.targetUser = targetUser;
    await db.MessageModel.updateMany({ty: 'UTU', r: user.uid, s: uid, vd: false}, {$set: {vd: true}});
    // 判断是否已创建聊天
    await db.CreatedChatModel.createChat(user.uid, uid);

    await next();
  })
  .post('/:uid', async (ctx, next) => {
    const {db, body, params, data, redis} = ctx;
    const {uid} = params;
    const targetUser = await db.UserModel.findOnly({uid});
    const {user} = data;
    // 判断是否有权限发送信息
    await db.MessageModel.ensureSystemLimitPermission(user.uid, targetUser.uid);
    await db.MessageModel.ensurePermission(user.uid, uid, data.userOperationsId.includes('canSendToEveryOne'));
    const {content, socketId} = body;
    if(content === '') ctx.throw(400, '内容不能为空');
    const _id = await db.SettingModel.operateSystemID('messages', 1);
    const message = db.MessageModel({
      _id,
      ty: 'UTU',
      c: content,
      s: user.uid,
      r: uid,
      ip: ctx.address,
      port: ctx.port
    });
    await message.save();
    // 判断是否已创建聊天
    await db.CreatedChatModel.createChat(user.uid, uid, true);
    const message_ = message.toObject();
    message_.socketId = socketId;
    await redis.pubMessage(message_);
    data.message = message;
    data.targetUser = targetUser;
    await next();
  });
module.exports = userRouter;