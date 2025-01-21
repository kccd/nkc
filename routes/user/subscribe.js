const Router = require('koa-router');
const subscribeRouter = new Router();
const {
  subscribeUserService,
} = require('../../services/subscribe/subscribeUser.service');
const { OnlyUnbannedUser } = require('../../middlewares/permission');
subscribeRouter
  // 关注该用户
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { params, body, db, data } = ctx;
    const targetUid = params.uid;
    const { user } = data;
    if (!targetUid) {
      ctx.throw(400, '参数不正确');
    }
    const { cid = [] } = body;
    if (user.uid === targetUid) {
      ctx.throw(400, '关注自己干嘛？');
    }
    await data.user.ensureSubLimit('user');
    for (const typeId of cid) {
      const subType = await db.SubscribeTypeModel.findOne({
        _id: typeId,
        uid: user.uid,
      });
      if (!subType) {
        ctx.throw(400, `未找到ID为${typeId}的关注分类`);
      }
    }
    await subscribeUserService.checkSubscribeUser(user.uid, targetUid);
    await subscribeUserService.subscribeUser(user.uid, targetUid, cid);
    await db.SubscribeModel.saveUserSubUsersId(user.uid);
    await db.SubscribeModel.saveUserFansId(targetUid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.data.targetUser = await db.UserModel.findOnly({ uid: targetUid });
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
  .del('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { params, db, data } = ctx;
    const targetUid = params.uid;
    const { user } = data;
    if (!targetUid) {
      ctx.throw(400, '参数不正确');
    }
    await subscribeUserService.unsubscribeUser(user.uid, targetUid);
    const cid = await subscribeUserService.getSubscribeUserCategoriesId(
      user.uid,
      targetUid,
    );
    await db.SubscribeModel.saveUserSubUsersId(user.uid);
    await db.SubscribeModel.saveUserFansId(targetUid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.data.targetUser = await db.UserModel.findOnly({ uid: targetUid });
    await db.KcbsRecordModel.insertSystemRecord(
      'unFollowed',
      ctx.data.targetUser,
      ctx,
    );
    await next();
  });

module.exports = subscribeRouter;
