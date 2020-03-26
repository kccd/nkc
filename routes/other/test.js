const Router = require('koa-router');
const fss = require('fs');
const testRouter = new Router();

testRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = "test/test.pug";
    let posts = await db.PostModel.find({pid: "873762"});
    posts = await db.PostModel.extendPosts(posts);
    data.post = posts[0];
    await next();
  })
  .get("/home", async (ctx, next) => {
    ctx.template = "home/home_all.pug";
    await next();
  });

module.exports = testRouter;