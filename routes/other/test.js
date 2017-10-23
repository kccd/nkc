const Router = require('koa-router');
const testRouter = new Router();
testRouter
  .get('/', async (ctx, next) => {
    console.log(`${ctx.ip}: ${JSON.stringify(ctx.request)}`);
    ctx.template = 'test.pug';
    await next();
  });
module.exports = testRouter;
