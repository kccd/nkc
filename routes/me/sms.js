const Router = require('koa-router');
const smsRouter = new Router();
smsRouter
  .get('/', async (ctx, next) => {
    ctx.data = '消息列表';
    next();
  });

module.exports = smsRouter;