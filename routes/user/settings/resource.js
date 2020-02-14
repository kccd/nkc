const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db, query} = ctx;
    data.selected = "resource";
    const {t, page} = query;
    data.t = t;
    ctx.template = "user/settings/resource/resource.pug";
    await next();
  });
module.exports = router;