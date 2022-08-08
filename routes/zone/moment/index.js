const router = require('koa-router')();
const commentRouter = require('./comments');
const repostRouter = require('./repost');
const voteRouter = require('./vote');
router
  .use('/:mid', async (ctx, next) => {
    const {internalData, db, params} = ctx;
    const {mid} = params;
    internalData.moment = await db.MomentModel.findOne({_id: mid});
    if(!internalData.moment) ctx.throw(404, `动态 ID 错误 momentId=${mid}`);
    await next();
  })
  .get('/:mid', async (ctx, next) => {
    const {permission, data, state, internalData, db} = ctx;
    const {moment} = internalData;
    let targetMoment;
    let commentId;
    let parentCommentId;
    if(moment.parents.length > 0) {
      targetMoment = await db.MomentModel.findOnly({_id: moment.parents[0]});
      commentId = moment._id;
      if(moment.parents.length > 1) {
        parentCommentId = moment.parents[1];
      }
    } else {
      targetMoment = moment;
      commentId = '';
    }
    const [momentListData] = await db.MomentModel.extendMomentsListData([targetMoment], state.uid);
    if(!momentListData) {
      ctx.throw(500, `动态数据错误 momentId=${moment._id}`);
    }
    data.permissions = {
      reviewed: state.uid && (permission('movePostsToRecycle') || permission('movePostsToDraft')),
    };
    data.parentCommentId = parentCommentId;
    data.commentId = commentId;
    data.momentListData = momentListData;
    ctx.remoteTemplate = 'zone/moment/moment.pug';
    await next();
  })
  .use('/:mid/vote', voteRouter.routes(), voteRouter.allowedMethods())
  .use('/:mid/comments', commentRouter.routes(), commentRouter.allowedMethods())
  .use('/:mid/repost', repostRouter.routes(), repostRouter.allowedMethods());
module.exports = router;
