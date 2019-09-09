const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "editor/editor.pug";
    await next();
  });
module.exports = router;