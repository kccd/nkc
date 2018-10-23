const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
  .patch('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {beep, messageSettings} = body;
    const usersGeneral = await db.UsersGeneralModel.findOnly({uid: user.uid});
    if(messageSettings) {
      await usersGeneral.update({messageSettings: messageSettings});
    } else {
      await usersGeneral.update({'messageSettings.beep': beep});
    }

    await next();
  })
  .patch('/:uid', async (ctx, next) => {
    const {data, db, params, body, redis} = ctx;
    const {info} = body;
    const {user} = data;
    const {uid} = params;
    if(info.name.length > 10) ctx.throw(400, '备注名不能超过10个字');
    if(info.description.length > 250) ctx.throw(400, '备注名不能超过250个字');
    const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
    if(!friend) ctx.throw(403, '您与该用户暂未建立好友关系');
    friend.info = info;
    await friend.save();
    friend.targetUser = await db.UserModel.findOnly({uid: friend.tUid});
    await redis.pubMessage({
      ty: 'modifyFriend',
      friend: friend.toObject()
    });
    await next();
  });
module.exports = settingsRouter;