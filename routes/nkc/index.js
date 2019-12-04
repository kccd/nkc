const router = require("koa-router")();
const homeRouter = require("./home");
router
  .get("/", async (ctx, next) => {
    ctx.template = "nkc/nkc.pug";
    await next();
  })
  .use("/home", homeRouter.routes(), homeRouter.allowedMethods());
module.exports = router;