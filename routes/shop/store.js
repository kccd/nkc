const Router = require('koa-router');
const storeRouter = new Router();
storeRouter
  .get('/:storeId', async (ctx, next) => {
    const {data, body, db, params} = ctx;
    // 获取商品id，并检查商品是否存在
    const {storeId} = params;
    const store = await db.ShopStoresModel.findOne({storeId});
    const storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    if(!store) ctx.throw(404, "店铺不存在");
    data.storeInfo = store;
    data.storeDecoration = storeDecoration;
    // 获取商品推荐
    let featuredProducts = await db.ShopGoodsModel.find({productId:{$in:storeDecoration.storeLeftFeatureds}})
    data.featuredProducts = await db.ShopGoodsModel.extendProductsInfo(featuredProducts);
    // 获取分类推荐
    data.storeClassFeatureds = await Promise.all(storeDecoration.storeClassFeatureds.map(async classify => {
      let classFeatureds = await db.ShopGoodsModel.find({productId:{$in:classify.productsArr}});
      classify.classFeatureds = await db.ShopGoodsModel.extendProductsInfo(classFeatureds);
      return classify
    }))
    ctx.template = "shop/store/store.pug";
    await next();
  })
module.exports = storeRouter;