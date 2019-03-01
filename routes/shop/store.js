const Router = require('koa-router');
const storeRouter = new Router();
storeRouter
  .get('/:storeId', async (ctx, next) => {
    const {data, body, db, params} = ctx;
    // 获取商品id，并检查商品是否存在
    const {storeId} = params;
    const store = await db.ShopStoresModel.findOne({storeId});
    if(!store) ctx.throw(404, "店铺不存在");
    data.storeInfo = store;
    ctx.template = "shop/store/store.pug";
    await next();
  })
module.exports = storeRouter;