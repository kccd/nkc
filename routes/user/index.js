const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const smsRouter = require('./sms');
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
    const users = await ctx.db.userModel.find({}).sort({toc: -1}).limit(10);
    const data = {users};
    ctx.data = data;
    next();
  })
  .get('/:uid', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data = `用户: ${uid}  的资料`;
    ctx.template = 'user.pug';
    next();
  })
  .del('/:uid', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data = `封禁用户: ${uid}`;
    next();
  })
  .put('/:uid', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data = `解封用户: ${uid}`;
    next();
  })
  .get('/:uid/column', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data = `用户: ${uid}  的专栏`;
    next();
  })
  .get('/:uid/collection', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data = `用户: ${uid}  的收藏`;
    next();
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data = `推送/取消热门 用户: ${uid}`;
    next();
  })
  
  /* .post('/', async (ctx, next) => {
    ctx.data = JSON.stringify(ctx.query) + JSON.stringify(ctx.request.body);
    next()
  }) */
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid/sms', smsRouter.routes(), smsRouter.allowedMethods())
module.exports = userRouter;