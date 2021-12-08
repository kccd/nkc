const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {state, nkcModules} = ctx;
    ctx.template = "app/download/download.pug";
    await next();
  });
module.exports = router;
