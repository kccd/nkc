const Router = require('koa-router');
const loginRouter = require('./login');
const registerRouter = require('./register');
const sendMessageRouter = require('./sendMessage');
const examRouter = require('./exam');
const forgotPasswordRouter = require('./forgotPassword');
const otherRouter = new Router();

otherRouter
  .get('/', async (ctx, next) => {
    ctx.body = `网站首页`;
    next();
  })
  .use('login', loginRouter.routes(), loginRouter.allowedMethods())
  .use('register', registerRouter.routes(), registerRouter.allowedMethods())
  .use('sendMessage', sendMessageRouter.routes(), sendMessageRouter.allowedMethods())
  .use('exam', examRouter.routes(), examRouter.allowedMethods())
  .use('forgotPassword', forgotPasswordRouter.routes(), forgotPasswordRouter.allowedMethods())
module.exports = otherRouter;