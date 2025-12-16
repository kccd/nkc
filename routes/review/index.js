const Router = require('koa-router');
const router = new Router();
const { eventEmitter } = require('../../events');
const { getMomentPublishType } = require('../../events/moment');
const { getJsonStringTextSlice } = require('../../nkcModules/json');
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
const {
  reviewModifierService,
} = require('../../services/review/reviewModifier.service');
const {
  reviewPostService,
} = require('../../services/review/reviewPost.service');
const {
  reviewDocumentService,
} = require('../../services/review/reviewDocument.service');
const {
  reviewNoteService,
} = require('../../services/review/reviewNote.service');
const {
  reviewUserService,
} = require('../../services/review/reviewUser.service');
const documentRouter = require('./document');
const postRouter = require('./post');
const noteRouter = require('./note');
const userRouter = require('./user');
router
  // 从审核记录表中加载待审记录
  // 根据来源拓展待审核的内容
  .get('/', OnlyOperation(Operations.review), async (ctx, next) => {
    const { data, query } = ctx;
    let page = parseInt(query.page);
    if (isNaN(page) || page < 0) {
      page = 0;
    }
    const perPage = 50;
    const postResults = await reviewPostService.getPendingReviewPosts({
      page,
      perPage,
      user: data.user,
      isSuperModerator: ctx.permission('superModerator'),
    });
    let paging = postResults.paging;
    const documentResults =
      await reviewDocumentService.getPendingReviewDocuments({
        page,
        perPage,
      });
    if (paging.count < documentResults.paging.count) {
      paging = documentResults.paging;
    }
    const noteResults = await reviewNoteService.getPendingReviewNotes({
      page,
      perPage,
    });
    if (paging.count < noteResults.paging.count) {
      paging = noteResults.paging;
    }
    const userResults = await reviewUserService.getPendingReviewUsers({
      page,
      perPage,
    });
    if (paging.count < userResults.paging.count) {
      paging = userResults.paging;
    }
    data.paging = paging;
    data.results = [
      ...postResults.data,
      ...documentResults.data,
      ...noteResults.data,
      ...userResults.data,
    ];
    ctx.template = 'review/review.pug';
    await next();
  })
  .use('/document', documentRouter.routes(), documentRouter.allowedMethods())
  .use('/post', postRouter.routes(), postRouter.allowedMethods())
  .use('/note', noteRouter.routes(), noteRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods());
module.exports = router;
