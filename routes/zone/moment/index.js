const router = require('koa-router')();
const { Public } = require('../../../middlewares/permission');
const commentRouter = require('./comments');
const repostRouter = require('./repost');
const voteRouter = require('./vote');
const historyRouter = require('./history');
const {
  momentCheckerService,
} = require('../../../services/moment/momentChecker.service');
router
  .use('/:mid', Public(), async (ctx, next) => {
    const { internalData, db, params, state, permission } = ctx;
    const { mid } = params;
    internalData.moment = await db.MomentModel.findOne({ _id: mid });
    if (!internalData.moment) {
      ctx.throw(404, `ID 错误 momentId=${mid}`);
    }
    await momentCheckerService.checkMomentPermission(
      state.uid,
      internalData.moment,
      permission('review'),
    );
    await next();
  })
  .get('/:mid', Public(), async (ctx, next) => {
    const { data } = ctx;
    data.currentPage = 'MomentDetail';
    ctx.remoteTemplate = 'zone/zone.pug';
    await next();
  })
  .use('/:mid/vote', voteRouter.routes(), voteRouter.allowedMethods())
  .use('/:mid/comments', commentRouter.routes(), commentRouter.allowedMethods())
  .use('/:mid/history', historyRouter.routes(), historyRouter.allowedMethods())
  .use('/:mid/repost', repostRouter.routes(), repostRouter.allowedMethods());
module.exports = router;
