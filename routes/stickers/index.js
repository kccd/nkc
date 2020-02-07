const router = require("koa-router")();
const uploadRouter = require("./upload");
router
  .get("/", async (ctx, next) => {
    const {query} = ctx;
    const {t} = query;
    if(t === "upload") {
      ctx.template = "stickers/upload/upload.pug";
    } else {
      ctx.template = "stickers/stickers.pug";
    }
    await next();
  })
  .use("/upload", uploadRouter.routes(), uploadRouter.allowedMethods());
module.exports = router;