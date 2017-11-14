const Router = require('koa-router');
const loginRouter = require('./login');
const logoutRouter = require('./logout');
const registerRouter = require('./register');
const sendMessageRouter = require('./sendMessage');
const examRouter = require('./exam');
const forgotPasswordRouter = require('./forgotPassword');
const smsRouter = require('./sms');
const otherRouter = new Router();
const editorRouter = require('./editor');
const avatar = require('./avatar');
const avatarSmall = require('./avatar_small');
// 用于测试的路由----------------------
const testRouter = require('./test');
const defaultRouter = require('./default');

// -----------------------------------
otherRouter
  .get('/', async (ctx, next) => {
    ctx.template = 'test.pug';
    await next();
  })
  .use('login', loginRouter.routes(), loginRouter.allowedMethods())
  .use('logout', logoutRouter.routes(), logoutRouter.allowedMethods())
  .use('register', registerRouter.routes(), registerRouter.allowedMethods())
  .use('sendMessage', sendMessageRouter.routes(), sendMessageRouter.allowedMethods())
  .use('exam', examRouter.routes(), examRouter.allowedMethods())
  .use('forgotPassword', forgotPasswordRouter.routes(), forgotPasswordRouter.allowedMethods())
  .use('editor', editorRouter.routes(), editorRouter.allowedMethods())
  .use('test', testRouter.routes(), testRouter.allowedMethods())
  .use('sms', smsRouter.routes(), smsRouter.allowedMethods())
  .use('avatar', avatar.routes(), avatar.allowedMethods())
  .use('avatar_small', avatarSmall.routes(), avatarSmall.allowedMethods())
  .use('default', defaultRouter.routes(), defaultRouter.allowedMethods());
module.exports = otherRouter;