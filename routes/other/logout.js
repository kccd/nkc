const Router = require('koa-router');
const logoutRouter = new Router();
logoutRouter
  .get('/', async (ctx, next) => {
    if(ctx.data.user) {
      ctx.setCookie("userInfo", "");
      ctx.data.user = undefined;
    }
    ctx.data.logout = true;
    ctx.template = 'interface_user_logout.pug';
    const urls = ctx.getCookie("visitedUrls") || [];
    if(urls.length === 0) {
      ctx.data.redirect = '/';
    } else {
      ctx.data.redirect = urls[0];
    }
    await next();
  });
module.exports = logoutRouter;