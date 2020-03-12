const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    ctx.template = "nkc/note/note.pug";
    await next();
  });
module.exports = router;