const router = require("koa-router")();
const homeRouter = require("./home");
const stickerRouter = require("./sticker");
const noteRouter = require("./note");
router
  .get("/", async (ctx, next) => {
    ctx.template = "nkc/nkc.pug";
    await next();
  })
  .use("/home", homeRouter.routes(), homeRouter.allowedMethods())
  .use("/note", noteRouter.routes(), noteRouter.allowedMethods())
  .use("/sticker", stickerRouter.routes(), stickerRouter.allowedMethods());
module.exports = router;