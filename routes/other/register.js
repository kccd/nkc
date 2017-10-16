const Router = require('koa-router');
const registerRouter = new Router();
registerRouter
  .get('/mobile', async (ctx, next) => {
    ctx.data = '手机注册页面';
    next();
  })
  .post('/mobile', async (ctx, next) => {
    ctx.data = '手机提交注册信息';
    next();
  })
  .get('/email', async (ctx, next) => {
    ctx.data = '邮箱注册页面';
    next();
  })
  .post('/email', async (ctx, next) => {
    ctx.data = '邮箱提交注册信息';
    next();
  })
module.exports = registerRouter;