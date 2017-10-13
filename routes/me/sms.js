const Router = require('koa-router');
const smsRouter = new Router();
smsRouter
  .get('/', async (ctx, next) => {
    ctx.body = '消息列表';
    next();
  });

module.exports = smsRouter;