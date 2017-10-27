const Router = require('koa-router');
const setRouter = require('./set');
const meRouter = new Router();


meRouter
  .get('/', async (ctx, next) => {
    ctx.data = `个人资料`;
    await next();
  })
  .use('/set', setRouter.routes(), setRouter.allowedMethods());
module.exports = meRouter;adsfasdfasdfadf