const Router = require("koa-router");
const router = new Router();
const postRouter = require("./post");
router
  .get("/", async (ctx, next) => {
    ctx.template = "columns/settings/info.pug";
    ctx.data.highlight = "info";
    await next();
  })
  .use("/post", postRouter.routes(), postRouter.allowedMethods());
module.exports = router;
