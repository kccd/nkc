const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
  .patch('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {beep, onlyReceiveFromFriends, messageSettings, limit} = body;
    const usersGeneral = await db.UsersGeneralModel.findOnly({uid: user.uid});
    if(messageSettings) {
      await usersGeneral.update({
        messageSettings
      });
    } else {
      if(
        limit.status &&
        !limit.timeLimit &&
        !limit.digestLimit &&
        !limit.xsfLimit &&
        Number(limit.gradeLimit) < 2
      ) ctx.throw(400, "请至少勾选一项防骚扰设置");
      await usersGeneral.update({
        'messageSettings.beep': beep,
        'messageSettings.onlyReceiveFromFriends': onlyReceiveFromFriends,
        "messageSettings.limit": limit
      });
    }
    await next();
  })
  .patch('/:uid', async (ctx, next) => {
    const {data, db, params, body, redis} = ctx;
    const {info, cid} = body;
    const {user} = data;
    const {uid} = params;
    if(info.name.length > 10) ctx.throw(400, '备注名不能超过10个字');
    if(info.description.length > 250) ctx.throw(400, '备注名不能超过250个字');
    const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
    if(!friend) ctx.throw(403, '您与该用户暂未建立好友关系');
    friend.info = info;
    const oldCid = friend.cid;
    friend.cid = cid;
    await db.FriendsCategoryModel.updateMany({uid: user.uid, _id: {$nin: cid}, friendsId: uid}, {$pull: {friendsId: uid}});
    await db.FriendsCategoryModel.updateMany({uid: user.uid, _id: {$in: cid}}, {$addToSet: {friendsId: uid}});
    await friend.save();
    friend.targetUser = await db.UserModel.findOnly({uid: friend.tUid});
    await redis.pubMessage({
      ty: 'modifyFriend',
      friend: friend.toObject()
    });
    const allCid = cid.concat(oldCid);
    const categories = await db.FriendsCategoryModel.find({uid: user.uid, _id: {$in: allCid}});
    for(const category of categories) {
      await redis.pubMessage({
        ty: 'editFriendCategory',
        editType: 'modify',
        category: category
      });
    }
    await next();
  });
module.exports = settingsRouter;