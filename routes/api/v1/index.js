const router = require('koa-router')();
const userRouter = require('./user');
const serverRouter = require('./server');
const accountRouter = require('./account');
const articlesRouter = require('./articles');
const threadsRouter = require('./threads');
const columnRouter = require('./column');
const recycleRouter = require('./recycle');
const usersRouter = require('./users');
router
  .use('/account', accountRouter.routes(), accountRouter.allowedMethods())
  .use('/server', serverRouter.routes(), serverRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/users', usersRouter.routes(), usersRouter.allowedMethods())
  .use('/articles', articlesRouter.routes(), articlesRouter.allowedMethods())
  .use('/threads', threadsRouter.routes(), threadsRouter.allowedMethods())
  .use('/column', columnRouter.routes(), columnRouter.allowedMethods())
  .use('/recycle', recycleRouter.routes(), recycleRouter.allowedMethods());
module.exports = router;
