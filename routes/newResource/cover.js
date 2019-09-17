const Router = require("koa-router");
const router = new Router();
router
  .get(["/", "/:hash"], async (ctx, next) => {
    const {params, nkcModules} = ctx;
    const {hash = ""} = params;
    ctx.filePath = await nkcModules.file.getPostCover(hash);
    await next();
  });
module.exports = router;
