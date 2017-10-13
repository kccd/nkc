const Router = require('koa-router');
const forgotPasswordRouter = new Router();
forgotPasswordRouter
.get('/mobile', async (ctx, next) => {
  ctx.body = '手机找回密码页面';
  next();
})
.post('/mobile', async (ctx, next) => {
  ctx.body = '手机找回密码提交 用户名、手机号、验证码';
  next();
})
.post('/mobile/newPassword', async (ctx, next) => {
  ctx.body = '手机找回密码提交 新的密码';
  next();
})
.get('/email', async (ctx, next) => {
  ctx.body = '邮箱找回密码页面';
  next();
})
.post('/email', async (ctx, next) => {
  ctx.body = '邮箱找回密码提交 用户名、邮箱号、验证码';
  next();
})
.post('/email/newPassword', async (ctx, next) => {
  ctx.body = '邮箱找回密码提交 新的密码';
  next();
})
  

module.exports = forgotPasswordRouter;