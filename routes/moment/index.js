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
      await moment.disableMoment();
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
      await next();
    },
  )
  .use('/:mid/ipInfo', iPInfoRouter.routes(), iPInfoRouter.allowedMethods())
  .use('/:mid/options', optionsRouter.routes(), optionsRouter.allowedMethods())
  .use('/:mid/visible', visibleRouter.routes(), visibleRouter.allowedMethods());
// .use('/:aid/unblock', unblockRouter.routes(), unblockRouter.allowedMethods())
// .use('/:aid/collection', collectionRouter.routes(), collectionRouter.allowedMethods())
module.exports = router;
