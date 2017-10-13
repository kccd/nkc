const Router = require('koa-router');
const operationRouter = new Router();

operationRouter
  .post('/recommend', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.body = `推荐post   pid：${pid}`;
    next();
  })
  .post('/quote', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.body = `引用post   pid：${pid}`;
    next();
  })
  .post('/cartPost', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.body = `加入管理车   pid：${pid}`;
    next();
  })
  .post('/addCredit', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.body = `评学术分   pid：${pid}`;
    next();
  })

module.exports = operationRouter;