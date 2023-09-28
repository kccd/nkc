const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    //获取动态下的评论
    const { db, data, internalData, query, nkcModules, state, permission } =
      ctx;
    const { moment } = internalData;
    const { user } = data;
    const momentCommentModes = await db.MomentModel.getMomentCommentModes();
    let {
      sort = 'time',
      page = 0,
      focus = '', // 需要高亮的评论ID，可为空字符串
      mode = momentCommentModes.simple,
    } = query;

    if (focus) {
      page = await db.MomentModel.getPageByMomentCommentId(mode, focus);
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
          status: normalStatus,
        },
        {
          uid: state.uid,
          status: {
            $in: [normalStatus, faultyStatus, unknownStatus],
          },
        },
      ],
    };
    if (user) {
      if (permission('review')) {
        delete match.$or[1].uid;
      }
    }
    const sortObj = sort === 'hot' ? { voteUp: -1, top: 1 } : { top: 1 };
    const count = await db.MomentModel.countDocuments(match);
    const perPage = await db.MomentModel.getMomentCommentPerPage(mode);
    const paging = nkcModules.apiFunction.paging(page, count, perPage);
    const comments = await db.MomentModel.find(match)
      .sort(sortObj)
      .skip(paging.start)
      .limit(paging.perpage);
    let commentsData = await db.MomentModel.extendCommentsData(
      comments,
      state.uid,
    );
    commentsData = await db.MomentModel.extendCommentsDataCommentsData(
      commentsData,
      state.uid,
      mode,
    );
    data.commentsData = commentsData;
    data.paging = paging;
    await next();
  })
  .get('/child', async (ctx, next) => {
    const { db, state, permission, data, query, internalData, nkcModules } =
      ctx;
    let { page = 0, sort = 'time', focus = '' } = query;
    const { moment: comment } = internalData;
    if (focus) {
      const _page = await db.MomentModel.getPageByMomentCommentId(
        comment._id,
        focus,
      );
      if (_page !== -1) {
        page = _page;
      }
    }
    const momentStatus = await db.MomentModel.getMomentStatus();
    const match = {
      parents: comment._id,
      $or: [
        {
          status: momentStatus.normal,
        },
        {
          uid: state.uid,
          status: {
            $in: [
              momentStatus.normal,
              momentStatus.faulty,
              momentStatus.unknown,
            ],
          },
        },
      ],
    };
    if (state.uid && permission('review')) {
      delete match.$or[1].uid;
    }
    const sortObj = sort === 'hot' ? { voteUp: -1, top: 1 } : { top: 1 };
    const count = await db.MomentModel.countDocuments(match);
    const perPage = await db.MomentModel.getMomentCommentPerPage();
    const paging = nkcModules.apiFunction.paging(page, count, perPage);
    const comments = await db.MomentModel.find(match)
      .sort(sortObj)
      .skip(paging.start)
      .limit(paging.perpage);
    comments.push(comment);
    let commentsData = await db.MomentModel.extendCommentsData(
      comments,
      state.uid,
    );
    const commentData = commentsData.pop();
    commentsData = await db.MomentModel.extendCommentsDataParentData(
      commentsData,
      state.uid,
    );
    data.commentsData = commentsData;
    data.commentData = commentData;
    data.paging = paging;
    data.permissions = {
      reviewed:
        state.uid &&
        (permission('movePostsToRecycle') || permission('movePostsToDraft')),
    };
    await next();
  });
module.exports = router;
