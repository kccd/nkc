const router = require('koa-router')();
const userRouter = require('./user');
const serverRouter = require('./server');
const accountRouter = require('./account');
router
  .use('/account', accountRouter.routes(), accountRouter.allowedMethods())
  .use('/server', serverRouter.routes(), serverRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods());
module.exports = router;
