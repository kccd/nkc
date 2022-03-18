const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data, internalData, query, nkcModules, state} = ctx;
    const {moment} = internalData;
    const {sort = 'hot', page = 0} = query;
    const match = {
      parent: moment._id,
      status: 'normal'
    };
    const sortObj = sort === 'hot'? {voteUp: -1, top: 1}: {top: -1};
    const count = await db.MomentModel.countDocuments(match);
    const perPage = await db.MomentModel.getMomentCommentPerPage();
    const paging = nkcModules.apiFunction.paging(page, count, perPage);
    const comments = await db.MomentModel.find(match)
      .sort(sortObj).skip(paging.start).limit(paging.perpage);
    data.commentsData = await db.MomentModel.extendCommentsData(comments, state.uid);
    data.paging = paging;
    await next();
  })
module.exports = router;