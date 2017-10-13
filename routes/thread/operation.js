const Router = require('koa-router');
const operationRouter = new Router();

operationRouter
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
  .post('/:tid/moveThread', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `移动帖子到   tid：${tid}`;
    next();
  })
  .post('/:tid/recycleThread', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `移动帖子到回收站   tid：${tid}`;
    next();
  })
  .post('/:tid/moveToPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.body = `移动帖子到个人版   tid：${tid}`;
    next();
  })
module.exports = operationRouter;