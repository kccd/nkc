const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const smsRouter = require('./sms');
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
    const users = await ctx.db.userModel.find({}).sort({toc: -1}).limit(10);
    const data = {users};
    ctx.body = ctx.nkcModules.render('./pages/users.pug', {data});
    next();
  })
  .get('/:uid', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.body = `用户: ${uid}  的资料`;
    next()
  })
  .get('/:uid/column', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.body = `用户: ${uid}  的专栏`;
    next()
  })
  /* .post('/', async (ctx, next) => {
    ctx.body = JSON.stringify(ctx.query) + JSON.stringify(ctx.request.body);
    next()
  }) */
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid/sms', smsRouter.routes(), smsRouter.allowedMethods())
module.exports = userRouter;