const router = require("koa-router")();
router
  // 我所发布的商品列表
  .get("/", async (ctx, next) => {
    const {data, db, query} = ctx;
    const {page} = query;
    const {user} = data;
    data.navType = "goods";
    ctx.template = "/shop/manage/goods/goods.pug";
    await next();
  });
module.exports = router;