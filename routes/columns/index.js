const Router = require("koa-router");
const router = new Router();
const columnRouter = require("./column");
router
  .get("/", async (ctx, next) => {
    await next();
  })
  .use("/:_id", columnRouter.routes(), columnRouter.allowedMethods());
module.exports = router;
