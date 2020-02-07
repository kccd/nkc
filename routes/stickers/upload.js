const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    ctx.template = "stickers/upload/upload.pug";
    await next();
  });
module.exports = router;