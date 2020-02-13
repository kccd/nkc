const router = require("koa-router")();
const homeRouter = require("./home");
const stickerRouter = require("./sticker");
router
  .get("/", async (ctx, next) => {
    ctx.template = "nkc/nkc.pug";
    await next();
  })
  .use("/home", homeRouter.routes(), homeRouter.allowedMethods())
  .use("/sticker", stickerRouter.routes(), stickerRouter.allowedMethods());
module.exports = router;