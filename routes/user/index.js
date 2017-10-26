const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const smsRouter = require('./sms');
const collectionsRouter = require('./collections');
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
    ctx.data.users = await ctx.db.UserModel.find({}).sort({toc: -1}).limit(10);
    await next();
  })
  .get('/:uid', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `用户: ${uid}  的资料`;
    ctx.template = 'user.pug';
    await next();
  })
  .del('/:uid', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `封禁用户: ${uid}`;
    await next();
  })
  .put('/:uid', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `解封用户: ${uid}`;
    await next();
  })
  .get('/:uid/column', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `用户: ${uid}  的专栏`;
    await next();
  })
  .get('/:uid/collection', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `用户: ${uid}  的收藏`;
    await next();
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `推送/取消热门 用户: ${uid}`;
    await next();
  })
  
  /* .post('/', async (ctx, next) => {
    ctx.data = JSON.stringify(ctx.query) + JSON.stringify(ctx.request.body);
    await next()
  }) */
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid/sms', smsRouter.routes(), smsRouter.allowedMethods())
  .use('/:uid/collections', collectionsRouter.routes(), collectionsRouter.allowedMethods());
module.exports = userRouter;