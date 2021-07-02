const Router = require('koa-router');
const messageRouter = new Router();
const systemInfoRouter = require('./systemInfo');
const remindRouter = require('./remind');
const userRouter = require('./user');
const resourceRouter = require('./resource');
const markRouter = require('./mark');
const settingsRouter = require('./settings');
const withdrawnRouter = require('./withdrawn');
const chatRouter = require('./chat');
const friendsApplicationRouter = require('./friendsApplication');
const dataRouter = require("./data");
const searchRouter = require('./search');
const frameRouter = require('./frame');
const addFriend = require("./addFriend");
const categoryRouter = require('./category');
const listRouter = require('./list');
const friendRouter = require('./friend');
const moment = require("moment");
messageRouter
  .get('/', async (ctx, next) => {
    ctx.template = 'message/message.2.pug';
    await next();
  })
  .use('/friendsApplication', friendsApplicationRouter.routes(), friendsApplicationRouter.allowedMethods())
  .use('/withdrawn', withdrawnRouter.routes(), withdrawnRouter.allowedMethods())
  .use('/mark', markRouter.routes(), markRouter.allowedMethods())
  .use('/remind', remindRouter.routes(), remindRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
  .use('/resource', resourceRouter.routes(), resourceRouter.allowedMethods())
  .use('/chat', chatRouter.routes(), chatRouter.allowedMethods())
  .use('/search', searchRouter.routes(), searchRouter.allowedMethods())
  .use('/systemInfo', systemInfoRouter.routes(), systemInfoRouter.allowedMethods())
  .use("/frame", frameRouter.routes(), frameRouter.allowedMethods())
  .use("/addFriend", addFriend.routes(), addFriend.allowedMethods())
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/list', listRouter.routes(), listRouter.allowedMethods())
  .use('/friend', friendRouter.routes(), friendRouter.allowedMethods())
  .use("/data", dataRouter.routes(), dataRouter.allowedMethods());
module.exports = messageRouter;
