const Router = require('koa-router');
const router = new Router();
const { Operations } = require('../../../settings/operations');
const { getUrl } = require('../../../nkcModules/tools');
const {
  momentHistoryService,
} = require('../../../services/moment/momentHistory.service');
router.get('/', async (ctx, next) => {
  const { state, data, query, db, params } = ctx;
  const { page = 0 } = query;
  const { mid } = params;
  const moment = await db.MomentModel.findOnly(
    { _id: mid },
    {
      uid: 1,
    },
  );
  if (
    state.uid !== moment.uid &&
    ctx.permission(Operations.visitOtherUserZoneMomentHistory)
  ) {
    ctx.throw(403, '权限不足');
  }

  const { histories, paging } = await momentHistoryService.getMomentHistoryList(
    {
      momentId: mid,
      page,
    },
  );
  data.momentUrl = getUrl('zoneMoment', mid);
  data.momentHistory = getUrl('zoneMomentHistory', mid);
  data.histories = histories;
  data.paging = paging;
  ctx.remoteTemplate = 'zone/moment/history/history.pug';
  await next();
});
module.exports = router;
