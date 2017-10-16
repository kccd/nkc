const Router = require('koa-router');
const operationRouter = new Router();

operationRouter
  .post('/addColl', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `收藏帖子   tid：${tid}`;
    next();
  })
  .post('/cartThread', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `加入管理车   tid：${tid}`;
    next();
  })
  .post('/adSwitch', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `首页顶置   tid：${tid}`;
    next();
  })
  .post('/setDigest', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `设置精华   tid：${tid}`;
    next();
  })
  .post('/setTopped', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `设置置顶   tid：${tid}`;
    next();
  })
  .post('/moveThread', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `移动帖子到   tid：${tid}`;
    next();
  })
  .post('/recycleThread', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `移动帖子到回收站   tid：${tid}`;
    next();
  })
  .post('/moveToPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `移动帖子到个人版   tid：${tid}`;
    next();
  })
  .post('/switchVInPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `在专栏显示隐藏   tid：${tid}`;
    next();
  })
  .post('/switchDInPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `在专栏加精   tid：${tid}`;
    next();
  })
  .post('/switchTInPersonalForum', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = `在专栏顶置   tid：${tid}`;
    next();
  });
module.exports = operationRouter;