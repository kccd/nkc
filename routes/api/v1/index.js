const router = require('koa-router')();
const userRouter = require('./user');
const articlesRouter = require('./articles');
const threadsRouter = require('./threads');
router
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/articles', articlesRouter.routes(), articlesRouter.allowedMethods())
  .use('/threads', threadsRouter.routes(), threadsRouter.allowedMethods());
module.exports = router;
