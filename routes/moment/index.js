const router = require('koa-router')();
const commentRouter = require('./comments');
router
  .use('/:mid', async (ctx, next) => {
    const {internalData, db, params} = ctx;
    const {mid} = params;
    internalData.moment = await db.MomentModel.findOnly({_id: mid});
    await next();
  })
  .get('/:mid', async (ctx, next) => {
    await next();
  })
  .use('/:mid/comments', commentRouter.routes(), commentRouter.allowedMethods());
module.exports = router;