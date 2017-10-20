const Router = require('koa-router');
const operationRouter = new Router();

operationRouter
  .post('/recommend', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `推荐post   pid：${pid}`;
    await next();
  })
  .post('/quote', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `引用post   pid：${pid}`;
    await next();
  })
  .post('/cartPost', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `加入管理车   pid：${pid}`;
    await next();
  })
  .post('/addCredit', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `评学术分   pid：${pid}`;
    await next();
  });

module.exports = operationRouter;