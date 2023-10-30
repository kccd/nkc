const router = require('koa-router')();
const { OnlyUser } = require('../../../../middlewares/permission');
const {
  momentListService,
} = require('../../../../services/moment/momentList.service');
// 获取推送的数据信息
router.get('/', OnlyUser(), async (ctx, next) => {
  const {
    state: { uid },
    query,
  } = ctx;
  const { momentIds } = query;
  if (!momentIds) {
    return await next();
  }
  ctx.apiData = await momentListService.getExtendMomentsList(uid, momentIds);
  await next();
});
module.exports = router;
