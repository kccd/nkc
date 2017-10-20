const Router = require('koa-router');
const forgotPasswordRouter = new Router();
forgotPasswordRouter
.get('/mobile', async (ctx, next) => {
  ctx.data = '手机找回密码页面';
  await next();
})
.post('/mobile', async (ctx, next) => {
  ctx.data = '手机找回密码提交 用户名、手机号、验证码';
  await next();
})
.post('/mobile/newPassword', async (ctx, next) => {
  ctx.data = '手机找回密码提交 新的密码';
  await next();
})
.get('/email', async (ctx, next) => {
  ctx.data = '邮箱找回密码页面';
  await next();
})
.post('/email', async (ctx, next) => {
  ctx.data = '邮箱找回密码提交 用户名、邮箱号、验证码';
  await next();
})
.post('/email/newPassword', async (ctx, next) => {
  ctx.data = '邮箱找回密码提交 新的密码';
  await next();
})
  

module.exports = forgotPasswordRouter;