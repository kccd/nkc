const testRouter = require('koa-router')();
testRouter
  .get('/', async (ctx, next) => {
    ctx.template = "test/test.pug";
    await next();
  })
  .get("/demo", async (ctx, next) => {
    ctx.template = "demo/index.pug";
    await next();
  });

module.exports = testRouter;
