const { OnlyOperation } = require('../../middlewares/permission');
const {
  reviewPostService,
} = require('../../services/review/reviewPost.service');
const { Operations } = require('../../settings/operations');

const router = require('koa-router')();

router.put('/', OnlyOperation(Operations.review), async (ctx, next) => {
  // 这里仅处理 post 通过审核
  const { body, state } = ctx;
  const { postsId } = body;
  await reviewPostService.markPostReviewAsApproved({
    postsId,
    uid: state.uid,
    isSuperModerator: ctx.permission('superModerator'),
  });
  await next();
});

module.exports = router;
