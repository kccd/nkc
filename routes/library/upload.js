const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    ctx.template = "library/upload.pug";
    await next();
  });
module.exports = router;