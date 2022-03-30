const Router = require("koa-router");
const router = new Router();
const threadRouter = require('./thread');
const columnRouter = require('./thread');
const forumRouter = require('./thread');
const userRouter = require('./thread');
const blackListRouter = require('./thread');
router
  .use('/thread', threadRouter.routes(), threadRouter.allowedMethods())
  .use('/column', columnRouter.routes(), columnRouter.allowedMethods())
  .use('/forum', forumRouter.routes(), forumRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/blackList', blackListRouter.routes(), blackListRouter.allowedMethods())

module.exports = router;
