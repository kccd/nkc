const Router = require('koa-router');
const router = new Router();
const { OnlyUser } = require('../../../../middlewares/permission');
const {
  publishPermissionService,
} = require('../../../../services/publish/publishPermission.service');
router.get('/permission', OnlyUser(), async (ctx, next) => {
  // 检测用户头像、用户名等基本信息
  const { type } = ctx.query;
  const uid = ctx.state.uid;
  ctx.apiData = {
    permissionStatus: await publishPermissionService.getPublishPermissionStatus(
      type,
      uid,
    ),
  };
  await next();
});
module.exports = router;
