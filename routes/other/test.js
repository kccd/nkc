const Router = require('koa-router');
const fss = require('fs');
const testRouter = new Router();

testRouter
  .get('/', async (ctx, next) => {
    ctx.template = "test/test.pug";
    await next();
  })
  .get("/home", async (ctx, next) => {
    ctx.template = "home/home_all.pug";
    await next();
  });

module.exports = testRouter;