'user strict'
const Router = require('koa-router');
const accountRouter = new Router();
accountRouter
  .get('/', async (ctx, next) => {
    ctx.template = 'shop/account/account.pug';
    await next();
  });
module.exports = accountRouter;