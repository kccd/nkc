const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "columns/settings/post.pug";
    const {data, db} = ctx;
    data.highlight = "post";
    await next();
  });
module.exports = router;