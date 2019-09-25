const Router = require('koa-router');

const testRouter = new Router();

testRouter
  .get('/', async (ctx, next) => {
    ctx.template = "test/test.pug";
    await next();
  });

module.exports = testRouter;