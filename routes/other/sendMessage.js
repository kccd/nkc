const Router = require('koa-router');
const sendMessageRouter = new Router();
sendMessageRouter
.post('/1', async (ctx, next) => {
  ctx.data = '发短信1';
  await next();
})
.post('/2', async (ctx, next) => {
  ctx.data = '发短信2';
  await next();
})
.post('/3', async (ctx, next) => {
  ctx.data = '发短信3';
  await next();
})
module.exports = sendMessageRouter;