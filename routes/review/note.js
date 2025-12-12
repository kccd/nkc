const { OnlyOperation } = require('../../middlewares/permission');
const {
  reviewNoteService,
} = require('../../services/review/reviewNote.service');
const { Operations } = require('../../settings/operations');
const router = require('koa-router')();
router.put('/', OnlyOperation(Operations.review), async (ctx, next) => {
  const { body } = ctx;
  const { note } = body;
  await reviewNoteService.markNoteReviewStatus({
    noteContent: note,
    ctx,
  });
  await next();
});
module.exports = router;
