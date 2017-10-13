const Router = require('koa-router');
const idRouter = require('./id');
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
  .post('/', async (ctx, next) => {
    ctx.body = JSON.stringify(ctx.query) + JSON.stringify(ctx.request.body);
    next()
  })
  .use('/:uid', idRouter.routes(), idRouter.allowedMethods())
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid')
  .use('/:uid/sms', smsRouter.routes(), smsRouter.allowedMethods())
module.exports = userRouter;