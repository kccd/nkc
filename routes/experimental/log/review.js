const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const {
  reviewFinderService,
} = require('../../../services/review/reviewFinder.service');
const router = new Router();
router.get(
  '/',
  OnlyOperation(Operations.experimentalReviewLog),
  async (ctx, next) => {
    const { data, query } = ctx;
    let page = parseInt(query.page);
    if (isNaN(page) || page < 0) {
      page = 0;
    }
    const t = (query.t || '').trim();
    const c = (query.c || '').trim();
    let search = null;
    if (['username', 'uid', 'id'].includes(t) && c) {
      search = {
        type: t,
        content: c,
      };
    }
    const { reviewLogs, paging } =
      await reviewFinderService.managerGetReviewLogs({
        page,
        perPage: 50,
        search: search,
      });
    data.reviewLogs = reviewLogs;
    data.paging = paging;
    data.t = t;
    data.c = c;
    ctx.template = 'experimental/log/review/review.pug';
    await next();
  },
);
module.exports = router;
