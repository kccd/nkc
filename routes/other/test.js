const testRouter = require('koa-router')();
testRouter
  .get('/', async (ctx, next) => {
    ctx.template = "test/test.pug";
    await next();
  })
  .get("/home", async (ctx, next) => {
    ctx.template = "home/home_all.pug";
    await next();
  })
  .put('/', async (ctx, next) => {
    await next();
  });

module.exports = testRouter;
