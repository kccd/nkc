const Router = require('koa-router');
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
  .del('/:tid', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `屏蔽帖子   tid：${tid}`;
    next();
  })
  .post('/:tid/addColl', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `收藏帖子   tid：${tid}`;
    next();
  })
  .post('/:tid/cartThread', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `加入管理车   tid：${tid}`;
    next();
  })
  .post('/:tid/adSwitch', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `首页顶置   tid：${tid}`;
    next();
  })
  .post('/:tid/setDigest', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `设置精华   tid：${tid}`;
    next();
  })
  .post('/:tid/setTopped', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `设置置顶   tid：${tid}`;
    next();
  })
module.exports = threadRouter;