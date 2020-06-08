const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, body, params, data} = ctx;
    data.message = "hhhhhhhhhhhh23333";
    await next();
  });
module.exports = router;