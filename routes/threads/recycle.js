const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    await next();
  });
module.exports = router;