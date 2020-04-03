const testRouter = require('koa-router')();
testRouter
  .get('/', async (ctx, next) => {
    const {db, query} = ctx;
    ctx.template = "test/test.pug";
    const nc = await db.NoteContentModel.find({
      content: {
        $regex: query.c,
        $options: "ig"
      },
    });
    console.log(`关键词：${query.c}`);
    return ctx.body = nc;
    await next();
  })
  .get("/home", async (ctx, next) => {
    ctx.template = "home/home_all.pug";
    await next();
  });

module.exports = testRouter;