const Router = require('koa-router');
const operationRouter = new Router();
const {
  collectionService,
} = require('../../services/subscribe/collection.service');
const {
  OnlyUnbannedUser,
  OnlyOperation,
} = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
operationRouter
  // //获取奖励的配置数据
  // .get("/rewards", async (ctx, next) => {
  //   const { db, data } = ctx;
  //   //
  //   data.creditScore = await db.SettingModel.getScoreByOperationType('creditScore');
  //   //
  //   data.creditSettings = await db.SettingModel.getCreditSettings();
  //   //
  //   data.xsfSettings = await db.SettingModel.getSettings("xsf");

  //   await next();
  // })
  // 收藏文章
  .post('/collection', OnlyUnbannedUser(), async (ctx, next) => {
    const { body, params, db, data } = ctx;
    const { tid } = params;
    const { type, cid = [] } = body;
    const { user } = data;
    const thread = await db.ThreadModel.findOnly({ tid });
    if (thread.disabled) {
      ctx.throw(403, '不能收藏已被封禁的文章');
    }
    await thread.extendForums(['mainForums', 'minorForums']);
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);

    if (type) {
      await collectionService.checkWhenCollectThread(user.uid, tid);
      for (const typeId of cid) {
        const subType = await db.SubscribeTypeModel.findOne({
          _id: typeId,
          uid: user.uid,
        });
        if (!subType) {
          ctx.throw(400, `未找到ID为${typeId}的关注分类`);
        }
      }
      await collectionService.collectThread(user.uid, tid, cid);
      await db.SubscribeTypeModel.updateCount(cid);
    } else {
      await collectionService.unCollectThread(user.uid, tid);
      const cid = await collectionService.getCollectedThreadCategoriesId(
        user.uid,
        tid,
      );
      await db.SubscribeTypeModel.updateCount(cid);
    }
    await db.SubscribeModel.saveUserCollectionThreadsId(user.uid);
    data.targetUser = await thread.extendUser();
    await next();
  })
  // 修改退修原因
  .put(
    '/moveDraft/reason',
    OnlyOperation(Operations.modifyReasonThreadReturn),
    async (ctx, next) => {
      const { body, db } = ctx;
      const { log } = body;
      if (!log.reason) {
        ctx.throw(400, '退修原因不能为空');
      }
      await db.DelPostLogModel.updateOne(
        {
          _id: log._id,
        },
        {
          $set: {
            reason: log.reason,
          },
        },
      );

      let mType,
        obj = {
          ty: 'STU',
        };
      if (log.postType === 'thread') {
        mType = 'threadWasReturned';
        obj[`c.tid`] = log.threadId;
      } else {
        mType = 'postWasReturned';
        obj[`c.pid`] = log.postId;
      }
      obj[`c.type`] = mType;

      await db.MessageModel.updateOne(obj, {
        $set: {
          'c.rea': log.reason,
        },
      });
      await next();
    },
  );
module.exports = operationRouter;
