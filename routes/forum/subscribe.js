const Router = require('koa-router');
const subscribeRouter = new Router();
const { subscribeSources } = require('../../settings/subscribe');
const {
  subscribeForumService,
} = require('../../services/subscribe/subscribeForum.service');
const { OnlyUnbannedUser } = require('../../middlewares/permission');

subscribeRouter
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, db, params, body } = ctx;
    const { fid } = params;
    const { cid = [] } = body;
    const { user } = data;
    const forum = await db.ForumModel.findOnly({ fid });

    await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
    const childrenForums = await forum.extendChildrenForums();

    if (childrenForums.length !== 0) {
      ctx.throw(400, '该专业下存在其他专业，无法订阅。');
    }

    await user.ensureSubLimit(subscribeSources.forum);

    const { subType } = forum;

    if (subType === 'unSub') {
      ctx.throw(400, '该专业不可订阅');
    }

    await subscribeForumService.checkSubscribeForum(user.uid, fid);

    for (const typeId of cid) {
      const type = await db.SubscribeTypeModel.findOne({
        _id: typeId,
        uid: user.uid,
      });
      if (!type) {
        ctx.throw(400, `未找到ID为${typeId}的订阅分类`);
      }
    }

    await subscribeForumService.subscribeForum(user.uid, fid, cid);

    await db.SubscribeModel.saveUserSubForumsId(user.uid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.state._scoreOperationForumsId = [fid];
    await db.KcbsRecordModel.insertSystemRecord('subscribeForum', user, ctx);
    await next();
  })
  .del('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, db, params } = ctx;
    const { user } = data;
    const { fid } = params;
    const forum = await db.ForumModel.findOnly({ fid }, { subType: 1 });
    const { subType } = forum;
    if (subType === 'force') {
      ctx.throw(400, '订阅该专业后不可取消');
    }
    await subscribeForumService.unsubscribeForum(user.uid, fid);
    const cid = await subscribeForumService.getSubscribeForumCategoriesId(
      user.uid,
      fid,
    );
    await db.SubscribeModel.saveUserSubForumsId(user.uid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.state._scoreOperationForumsId = [fid];
    await db.KcbsRecordModel.insertSystemRecord('unSubscribeForum', user, ctx);
    await next();
  });

module.exports = subscribeRouter;
