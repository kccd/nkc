const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    data.nav = "section";
    ctx.template = "nkc/section/section.pug";
    await next();
  });
module.exports = router;