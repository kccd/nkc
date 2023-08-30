const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
  // 关注该用户
  .post('/', async (ctx, next) => {
    let { uid } = ctx.params;
    if (!uid) {
      ctx.throw(400, '参数不正确');
    }
    let { db } = ctx;
    let { cid = [] } = ctx.body;
    let { user } = ctx.data;
    if (user.uid === uid) {
      ctx.throw(400, '关注自己干嘛？');
    }
    await user.ensureSubLimit('user');
    for (const typeId of cid) {
      const subType = await db.SubscribeTypeModel.findOne({
        _id: typeId,
        uid: user.uid,
      });
      if (!subType) {
        ctx.throw(400, `未找到ID为${typeId}的关注分类`);
      }
    }
    let sub = await db.SubscribeModel.findOne({
      type: 'user',
      cancel: false,
      uid: user.uid,
      tUid: uid,
    });
    if (sub) {
      ctx.throw(400, '您之前已经关注过该用户了，没有必要重新关注');
    }

    sub = db.SubscribeModel({
      _id: await db.SettingModel.operateSystemID('subscribes', 1),
      type: 'user',
      uid: user.uid,
      cid,
      tUid: uid,
    });

    await sub.save();
    await db.SubscribeModel.saveUserSubUsersId(user.uid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.data.targetUser = await db.UserModel.findOnly({ uid });
    await db.KcbsRecordModel.insertSystemRecord(
      'followed',
      ctx.data.targetUser,
      ctx,
    );
    await db.BlacklistModel.removeUserFromBlacklist(
      user.uid,
      ctx.data.targetUser.uid,
    );
    await next();
  })
  // 取消关注该用户
  .del('/', async (ctx, next) => {
    let { uid } = ctx.params;
    if (!uid) {
      ctx.throw(400, '参数不正确');
    }
    let { db } = ctx;
    let { user } = ctx.data;
    const sub = await db.SubscribeModel.findOne({
      type: 'user',
      uid: user.uid,
      cancel: false,
      tUid: uid,
    });
    if (!sub) {
      ctx.throw(400, '您之前没有关注过该用户，操作无效');
    }
    const cid = sub.cid;
    await sub.cancelSubscribe();
    // await sub.deleteOne();
    await db.SubscribeModel.saveUserSubUsersId(user.uid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.data.targetUser = await db.UserModel.findOnly({ uid });
    await db.KcbsRecordModel.insertSystemRecord(
      'unFollowed',
      ctx.data.targetUser,
      ctx,
    );
    await next();
  });

module.exports = subscribeRouter;
