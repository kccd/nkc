const Router = require('koa-router');
const operationRouter = require('./operation');
const postRouter = new Router();

postRouter
  .get('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `加载post   pid：${pid}`;
    next();
  })
  .del('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `屏蔽post   pid：${pid}`;
    next();
  })
  .get('/:pid/postHistory', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `历史修改记录 页面   pid：${pid}`;
    next();
  })
  .get('/:pid/editor', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `编辑post页面   pid：${pid}`;
    next();
  })
  .put('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.data = `更新post   pid：${pid}`;
    lksdjlfjdslfk();
    next();
  })
  .use('/:pid', operationRouter.routes(), operationRouter.allowedMethods())



module.exports = postRouter;