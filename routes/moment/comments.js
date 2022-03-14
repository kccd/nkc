const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data, internalData, query, nkcModules} = ctx;
    const {moment} = internalData;
    const {sort = 'hot', page = 0} = query;
    const match = {
      parent: moment._id
    };
    const sortObj = sort === 'hot'? {voteUp: -1}: {tlm: -1};
    const count = await db.MomentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count, 3);
    const comments = await db.MomentModel.find(match)
      .sort(sortObj).skip(paging.start).limit(paging.perpage);
    data.commentsData = await db.MomentModel.extendCommentsData(comments);
    data.paging = paging;
    await next();
  })
module.exports = router;