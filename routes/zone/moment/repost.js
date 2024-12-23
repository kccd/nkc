const router = require('koa-router')();
const { Public } = require('../../../middlewares/permission');

router.get('/', Public(), async (ctx, next) => {
  const { db, data, internalData, query, nkcModules, state, permission } = ctx;
  const { moment } = internalData;
  const { page = 0 } = query;
  const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
  const momentStatus = await db.MomentModel.getMomentStatus();
  const match = {
    quoteType: momentQuoteTypes.moment,
    quoteId: moment._id,
    status: momentStatus.normal,
  };
  const count = await db.MomentModel.countDocuments(match);
  const paging = await nkcModules.apiFunction.paging(page, count);
  const moments = await db.MomentModel.find(match)
    .sort({ toc: -1 })
    .skip(paging.start)
    .limit(paging.perpage);
  data.repostData = await db.MomentModel.extendMomentsListData(
    moments,
    state.uid,
  );
  data.paging = paging;
  await next();
});

module.exports = router;
