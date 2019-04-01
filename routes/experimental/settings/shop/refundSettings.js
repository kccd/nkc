const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = 'experimental/shop/refund/settings.pug';
    await next();
  });
module.exports = router;