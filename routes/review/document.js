const { OnlyOperation } = require('../../middlewares/permission');
const {
  reviewDocumentService,
} = require('../../services/review/reviewDocument.service');
const { Operations } = require('../../settings/operations');

const router = require('koa-router')();
router.put('/', OnlyOperation(Operations.review), async (ctx, next) => {
  const { body } = ctx;
  const { document } = body;
  await reviewDocumentService.markDocumentReviewStatus({
    document,
    ctx,
  });
  await next();
});
module.exports = router;
