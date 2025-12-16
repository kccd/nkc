const {
  reviewUserService,
} = require('../../services/review/reviewUser.service');
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
const router = require('koa-router')();

router.put('/', OnlyOperation(Operations.review), async (ctx, next) => {
  const { body } = ctx;
  const { user } = body;
  await reviewUserService.markUserAuditReviewStatus({
    user,
    ctx,
  });
  await next();
});
module.exports = router;
