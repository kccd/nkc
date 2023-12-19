const router = require('koa-router')();
const commentRouter = require('./comments');
const repostRouter = require('./repost');
const voteRouter = require('./vote');
const historyRouter = require('./history');
router
  .use('/:mid', async (ctx, next) => {
    const { internalData, db, params, state, permission } = ctx;
    const { mid } = params;
    internalData.moment = await db.MomentModel.findOne({ _id: mid });
    if (!internalData.moment) {
      ctx.throw(404, `动态 ID 错误 momentId=${mid}`);
    }
    const { uid, status } = internalData.moment;
    //正常、删除电文状态
    const { normal: normalMomentStatus, deleted: deleteMomentStatus } =
      await db.MomentModel.getMomentStatus();
    if (
      uid === state.uid &&
      status === deleteMomentStatus &&
      !permission('review')
    ) {
      // 动态主，动态已删除
      ctx.throw(403, `动态已删除，您无权查看此动态`);
    } else if (
      uid !== state.uid &&
      status !== normalMomentStatus &&
      !permission('review')
    ) {
      // 查看其他人的动态，动态需为正常状态
      ctx.throw(403, `此动态状态异常，您无权查看此动态`);
    }
    await next();
  })
  .get('/:mid', async (ctx, next) => {
    const { permission, data, state, internalData, db } = ctx;
    const { moment } = internalData;
    let targetMoment;
    let focusCommentId;
    if (moment.parents.length > 0) {
      targetMoment = await db.MomentModel.findOnly({ _id: moment.parents[0] });
      focusCommentId = moment._id;
    } else {
      targetMoment = moment;
      focusCommentId = '';
    }
    const [momentListData] = await db.MomentModel.extendMomentsListData(
      [targetMoment],
      state.uid,
    );
    if (!momentListData) {
      ctx.throw(500, `动态数据错误 momentId=${moment._id}`);
    }
    data.permissions = {
      reviewed:
        state.uid &&
        (permission('movePostsToRecycle') || permission('movePostsToDraft')),
    };
    data.focusCommentId = focusCommentId;
    data.momentListData = momentListData;
    ctx.remoteTemplate = 'zone/moment/moment.pug';
    await moment.addMomentHits();
    await next();
  })
  .use('/:mid/vote', voteRouter.routes(), voteRouter.allowedMethods())
  .use('/:mid/comments', commentRouter.routes(), commentRouter.allowedMethods())
  .use('/:mid/history', historyRouter.routes(), historyRouter.allowedMethods())
  .use('/:mid/repost', repostRouter.routes(), repostRouter.allowedMethods());
module.exports = router;
