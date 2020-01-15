const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {state} = ctx;
    ctx.template = "app/nav/nav.pug";
    state.isApp = true;
    await next();
  });
module.exports = router;