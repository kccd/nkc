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
    messages.map(m => {
      if(m.withdrawn) m.c = '';
    });
    data.messages = messages.reverse();
    data.targetUser = targetUser;
    await next();
  })
  .post('/:uid', async (ctx, next) => {
    const {db, body, params, data, nkcModules, redis} = ctx;
    const {uid} = params;
    const targetUser = await db.UserModel.findOnly({uid});
    const {user} = data;
    const {messageCountLimit, messagePersonCountLimit} = await user.getMessageLimit();
    const today = nkcModules.apiFunction.today();
    const messageCount = await db.MessageModel.count({
      s: user.uid,
      ty: 'UTU',
      tc: {
        $gte: today
      }
    });
    if(messageCount >= messageCountLimit) {
      ctx.throw(403, `根据您的证书和等级，您每天最多只能发送${messageCountLimit}条信息`);
    }
    let todayUid = await db.MessageModel.aggregate([
      {
        $match: {
          s: user.uid,
          ty: 'UTU',
          tc: {
            $gte: nkcModules.apiFunction.today()
          }
        }
      },
      {
        $group: {
          _id: '$r',
        }
      }
    ]);
    todayUid = todayUid.map(o => o.uid);
    if(!todayUid.includes(uid)) {
      if(todayUid.length >= messagePersonCountLimit) {
        ctx.throw(403, `根据您的证书和等级，您每天最多只能给${messagePersonCountLimit}个用户发送信息`);
      }
    }
    const {content, toc} = body;
    if(content === '') ctx.throw(400, '内容不能为空');
    const _id = await db.SettingModel.operateSystemID('messages', 1);
    const message = db.MessageModel({
      _id,
      ty: 'UTU',
      tc: toc,
      c: content,
      s: user.uid,
      r: uid,
      ip: ctx.address,
      port: ctx.port
    });

    await message.save();
    await redis.pubMessage(message);
    data.message = message;
    data.targetUser = targetUser;
    await next();
  });
module.exports = userRouter;