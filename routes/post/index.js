const Router = require('koa-router');
const postRouter = new Router();

postRouter
  .get('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.body = `加载post   pid：${pid}`;
    next();
  })
  .del('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.body = `屏蔽post   pid：${pid}`;
    next();
  })
  .post('/:pid', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.body = `更新post   pid：${pid}`;
    next();
  })
  .post('/:pid/recommend', async (ctx, next) => {
    const pid = ctx.params.pid;
    ctx.body = `修改post   pid：${pid}`;
    next();
  })

module.exports = postRouter;