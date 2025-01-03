const { OnlyUser } = require('../../../middlewares/permission');

const router = require('koa-router')();
router.get('/', OnlyUser(), async (ctx, next) => {
  const { query, db, data, state, nkcModules, permission } = ctx;
  const { user } = data;
  const { page } = query;
  //获取当前用户对动态的审核权限
  const permissions = {
    reviewed: null,
  };
  if (user) {
    if (permission('movePostsToRecycle') || permission('movePostsToDraft')) {
      permissions.reviewed = true;
    }
  }
  const authorMomentStatus = await db.MomentModel.getAuthorMomentStatus();
  const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
  // 获取动态列表
  const match = {
    uid: state.uid,
    parent: '',
    status: {
      $in: authorMomentStatus,
    },
    quoteType: {
      $in: ['', momentQuoteTypes.moment],
    },
  };
  const count = await db.MomentModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const moments = await db.MomentModel.find(match)
    .sort({ top: -1 })
    .skip(paging.start)
    .limit(paging.perpage);
  data.momentsData = await db.MomentModel.extendMomentsListData(
    moments,
    state.uid,
  );
  data.paging = paging;
  data.permissions = permissions;
  await next();
});
module.exports = router;
