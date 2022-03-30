const Router = require("koa-router");
const router = new Router();
const threadRouter = require('./thread');
const columnRouter = require('./column');
const forumRouter = require('./forum');
const userRouter = require('./user');
const blackListRouter = require('./blackList');
router
  .use('/subThread', threadRouter.routes(), threadRouter.allowedMethods())
  .use('/subColumn', columnRouter.routes(), columnRouter.allowedMethods())
  .use('/subForum', forumRouter.routes(), forumRouter.allowedMethods())
  .use('/subUser', userRouter.routes(), userRouter.allowedMethods())
  .use('/blackList', blackListRouter.routes(), blackListRouter.allowedMethods())

module.exports = router;
