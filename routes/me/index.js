const Router = require('koa-router');
const smsRouter = require('./sms');
const meRouter = new Router();


meRouter
  .use('/sms', smsRouter.routes(), smsRouter.allowedMethods())
module.exports = meRouter;