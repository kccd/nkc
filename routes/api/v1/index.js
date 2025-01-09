const Router = require('koa-router');
const router = new Router();
const userRouter = require('./user');
const serverRouter = require('./server');
const accountRouter = require('./account');
const articlesRouter = require('./articles');
const threadsRouter = require('./threads');
const threadRouter = require('./thread');
const columnRouter = require('./column');
const usersRouter = require('./users');
const examRouter = require('./exam');
const forumsRouter = require('./forums');
const registerRouter = require('./register');
const zoneRouter = require('./zone');
const settingsRouter = require('./settings');
router
  .use('/account', accountRouter.routes(), accountRouter.allowedMethods())
  .use('/server', serverRouter.routes(), serverRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/forums', forumsRouter.routes(), forumsRouter.allowedMethods())
  .use('/users', usersRouter.routes(), usersRouter.allowedMethods())
  .use('/articles', articlesRouter.routes(), articlesRouter.allowedMethods())
  .use('/threads', threadsRouter.routes(), threadsRouter.allowedMethods())
  .use('/column', columnRouter.routes(), columnRouter.allowedMethods())
  .use('/exam', examRouter.routes(), examRouter.allowedMethods())
  .use('/register', registerRouter.routes(), registerRouter.allowedMethods())
  .use('/thread/:tid', threadRouter.routes(), threadRouter.allowedMethods())
  .use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
  .use('/zone', zoneRouter.routes(), zoneRouter.allowedMethods());
module.exports = router;
