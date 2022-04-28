const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    //获取动态下的评论
    const {db, data, internalData, query, nkcModules, state, permission} = ctx;
    const {moment} = internalData;
    const {user} = data;
    let {
      sort = 'hot',
      page = 0,
      focus = '', // 需要高亮的评论ID，可为空字符串
    } = query;

    if(focus) {
      page = await db.MomentModel.getPageByMomentCommentId(focus);
    }
    const {
      normal: normalStatus,
      faulty: faultyStatus,
      unknown: unknownStatus,
    } = await db.MomentModel.getMomentStatus();
    const match = {
      parent: moment._id,
      $or: [
        {
          status: normalStatus
        },
        {
          uid: state.uid,
          status: {
            $in: [
              normalStatus,
              faultyStatus,
              unknownStatus,
            ]
          }
        }
      ]
    };
    if(user) {
      if(permission('review')) {
        delete match.status;
        delete match.$or;
      }
    }
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
