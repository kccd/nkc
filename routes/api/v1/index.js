const router = require('koa-router')();
const userRouter = require('./user');
router
  .use('/user', userRouter.routes(), userRouter.allowedMethods());
module.exports = router;
