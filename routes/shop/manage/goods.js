const router = require("koa-router")();
router
  // 我所发布的商品列表
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page, t} = query;
    const {user} = data;
    data.navType = "goods";
    data.t = t;
    const q = {
      uid: user.uid
    };
    if(!t || t === "onSale") {
      q.productStatus = "insale";
    } else if(t === "stopped") {
      q.productStatus = "stopsale";
    } else {
      q.productStatus = "notonshelf";
    }
    const count = await db.ShopGoodsModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const products = await db.ShopGoodsModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.products = await db.ShopGoodsModel.extendProductsInfo(products);
    ctx.template = "/shop/manage/goods/goods.pug";
    data.paging = paging;
    await next();
  });
module.exports = router;