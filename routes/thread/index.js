const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();

threadRouter
  .post('/:tid', async (ctx, next) => {
    const tid = ctx.params.tid;
    const messageObj = ctx.request.body;
    ctx.body = `回复帖子   tid：${tid}，回帖信息：${JSON.stringify(messageObj)}`;
    next();
  })
  .get('/:tid', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `加载帖子   tid：${tid}`;
    next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods())
module.exports = threadRouter;