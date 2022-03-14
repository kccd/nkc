const router = require('koa-router')();
const commentRouter = require('./comments');
router
  .get('/:mid', async (ctx, next) => {
    await next();
  })
  .use('/:mid/comments', commentRouter.routes(), commentRouter.allowedMethods());
module.exports = router;