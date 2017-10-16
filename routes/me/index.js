const Router = require('koa-router');
const setRouter = require('./set');
const smsRouter = require('./sms');
const meRouter = new Router();


meRouter
  .get('/', async (ctx, next) => {
    ctx.data = `个人资料`;
    next();
  })
  .use('/set', setRouter.routes(), setRouter.allowedMethods())
  .use('/sms', smsRouter.routes(), smsRouter.allowedMethods())
module.exports = meRouter;