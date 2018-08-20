const Router = require('koa-router');
const userRouter = new Router();
userRouter
  .get('/:uid', async (ctx, next) => {
    const {data, db, query, params} = ctx;
    const {uid} = params;
    const {user} = data;
    const {lastMessageId} = query;
    await db.SocketModel.update({uid: user.uid}, {targetUid: uid});
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
    if(lastMessageId) {
      q._id = {$lt: lastMessageId};
    }
    await db.MessageModel.updateMany({
      r: user.uid,
      s: uid,
      vd: false
    }, {
      $set: {
        vd: true
      }
    });
    const messages = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
    data.messages = messages.reverse();
    data.targetUser = targetUser;
    await next();
  })
  .post('/:uid', async (ctx, next) => {
    const {db, body, params, data} = ctx;
    const {uid} = params;
    const targetUser = await db.UserModel.findOnly({uid});
    const {user} = data;
    const {content, toc} = body;
    if(content === '') ctx.throw(400, '内容不能为空');
    const _id = await db.SettingModel.operateSystemID('messages', 1);
    const newMessage = db.MessageModel({
      _id,
      ty: 'UTU',
      tc: toc,
      c: content,
      s: user.uid,
      r: uid
    });
    await newMessage.save();
    if(targetUser.online) {
      const targetSocket = await db.SocketModel.findOne({uid});
      global.NKC.io.to(targetSocket.socketId).emit('UTU', {
        fromUser: user,
        message: newMessage
      });
      console.log(targetSocket.targetUid, user.uid);
      if(targetSocket.targetUid === user.uid) {
        await newMessage.update({vd: true});
      }
    }
    data.newMessage = newMessage;
    await next();
  });
module.exports = userRouter;