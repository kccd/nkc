const router = require('koa-router')();
const optionsRouter = require('./option');
const iPInfoRouter = require('./ipInfo');
const visibleRouter = require('./visible');
const {
  OnlyUnbannedUser,
  OnlyOperation,
} = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router
  .del('/:mid', OnlyUnbannedUser(), async (ctx, next) => {
    //删除动态
    const { params, db, state, data, permission } = ctx;
    const { mid } = params;
    const { uid } = state;
    const moment = await db.MomentModel.findOnly({ _id: mid });
    if (!moment) {
      ctx.throw(400, '未找到动态，请刷新');
    }
    if (moment.uid !== uid && !permission('managementMoment')) {
      return ctx.throw(401, '权限不足');
    }
    //将当前动态标记为删除
    await moment.deleteMoment();
    await next();
  })
  .post(
    '/:mid/disable',
    OnlyOperation(Operations.managementMoment),
    async (ctx, next) => {
      //屏蔽动态
      const { params, db, state, data, permission, body, tools } = ctx;
      const { mid } = params;
      const { reason, remindUser = false } = body;
      const { uid } = state;
      const { contentLength } = tools.checkString;
      if (!reason) {
        ctx.throw(400, '屏蔽理由不能为空');
      }
      if (contentLength(reason) > 500) {
        ctx.throw(400, '原因字数不能超过500');
      }
      const moment = await db.MomentModel.findOnly({ _id: mid });
      if (!moment) {
        ctx.throw(400, '未找到动态，请刷新');
      }
      // if (moment.uid !== uid && !permission('managementMoment')) {
      //   return ctx.throw(401, '权限不足');
      // }
      // 创建动态(moment)屏蔽记录。
      //将当前动态标记为删除
      await moment.disableMoment();
      if (remindUser) {
        // 发送消息
        const message = await db.MessageModel({
          _id: await db.SettingModel.operateSystemID('messages', 1),
          r: moment.uid,
          ty: 'STU',
          c: {
            type: moment.parent
              ? 'momentCommentWasReturned'
              : 'momentWasReturned',
            momentId: moment._id,
            reason,
          },
        });
        await message.save();
        await ctx.nkcModules.socket.sendMessageToUser(message._id);
      }
      await db.DisMomentLogModel.createLog({
        reason,
        momentType: moment.parent ? 'comment' : 'moment',
        momentId: moment._id,
        noticeUser: remindUser,
        recovered: false,
        operator: uid,
        uid: moment.uid,
      });
      await next();
    },
  )
  .post(
    '/:mid/recovery',
    OnlyOperation(Operations.managementMoment),
    async (ctx, next) => {
      const { params, db } = ctx;
      const { mid } = params;
      const moment = await db.MomentModel.findOnly({ _id: mid });
      if (!moment) {
        ctx.throw(400, '未找到动态，请刷新');
      }
      await moment.recoveryMoment();
      // 更新对应的动态(moment)屏蔽记录。
      const log = await db.DisMomentLogModel.findOne({
        momentId: moment._id,
      }).sort({ toc: -1 });
      await log.updateOne({
        $set: {
          recovered: true,
        },
      });
      await next();
    },
  )
  .use('/:mid/ipInfo', iPInfoRouter.routes(), iPInfoRouter.allowedMethods())
  .use('/:mid/options', optionsRouter.routes(), optionsRouter.allowedMethods())
  .use('/:mid/visible', visibleRouter.routes(), visibleRouter.allowedMethods());
// .use('/:aid/unblock', unblockRouter.routes(), unblockRouter.allowedMethods())
// .use('/:aid/collection', collectionRouter.routes(), collectionRouter.allowedMethods())
module.exports = router;
