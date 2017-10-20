const Router = require('koa-router');
const logoutRouter = new Router();
logoutRouter
  .get('/', async (ctx, next) => {
    if(ctx.data.user) {
      ctx.cookies.set('userInfo', '');
    }
    ctx.data.logout = true;
    ctx.template = 'interface_user_logout.pug';
    next();
  });
module.exports = logoutRouter;