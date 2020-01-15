const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    ctx.template = "app/nav/nav.pug";
    await next();
  });
module.exports = router;