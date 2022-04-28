const Router = require('koa-router');
const logoutRouter = new Router();
logoutRouter
  .get('/', async (ctx, next) => {
    if(ctx.data.user) {
      ctx.clearCookie('userInfo');
      ctx.data.user = undefined;
    }
    ctx.data.logout = true;
    await next();
  });
module.exports = logoutRouter;