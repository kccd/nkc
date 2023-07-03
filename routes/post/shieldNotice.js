const Router = require('koa-router');
const router = new Router();
const { ThrowCommonError } = require('../../nkcModules/error');
router.put('/', async (ctx, next) => {
  const { db, params, body } = ctx;
  const { nid } = params;
  const { isShield } = body;
  const { status } = await db.NewNoticesModel.findOnly({ nid }, { status: 1 });
  const { normal, shield } = await db.NewNoticesModel.noticeStatus();
  //判断用户是否有权限屏蔽
  if (!ctx.permission('editNoticeContent')) {
    ThrowCommonError(403, '您没有相应的权限，或等级不足');
  }
  //判断通告是否已经屏蔽
  if (status === shield && isShield) {
    ThrowCommonError(403, '该通告已经屏蔽，请不要重复操作');
  } else if (status === shield && !isShield) {
    await db.NewNoticesModel.updateOne({ nid }, { status: normal });
  } else if (status === normal && !isShield) {
    ThrowCommonError(403, '该通告已经解除屏蔽，请不要重复操作');
  } else {
    await db.NewNoticesModel.updateOne({ nid }, { status: shield });
  }
  await next();
});
module.exports = router;
