const Router = require('koa-router');
const shopRouter = new Router();
const productRouter = require('./product');
const manageRouter = require('./manage');
const openStoreRouter = require('./openStore');
const storeRouter = require('./store');
const accountRouter = require('./account');
const cartRouter = require('./cart');
const billRouter = require('./bill');
const orderRouter = require('./order');
const payRouter = require('./pay');
const refundRouter = require('./refund');
const certRouter = require('./cert');
shopRouter
  .use("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    if(!user) await next();
    data.shopInfo = {
      cartProductCount: await db.ShopCartModel.getProductCount(user)
    };
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db ,query, params} = ctx;
    const homeSetting = await db.ShopSettingsModel.findOne({type:"homeSetting"});
    // 取出精选商品
    let featuredItems = await db.ShopGoodsModel.find({productId:{$in:homeSetting.featureds}});
    data.featuredItems = await db.ShopGoodsModel.extendProductsInfo(featuredItems);
    // 取出热门商品
    let popularItems = await db.ShopGoodsModel.find({productId:{$in:homeSetting.populars}});
    data.popularItems = await db.ShopGoodsModel.extendProductsInfo(popularItems);
    data.homeSetting = homeSetting;
    // await Promise.all(featuredItems.map(async featured => {
    //   let store = await db.ShopStoresModel.findOne({storeId: featured.storeId});
    //   if(store){
    //     featured.storeName = store.storeName;
    //   }else {
    //     featured.storeName = "";
    //   }
    // }));
    if(query.t === 'old') {
      ctx.template = 'shop/index.pug';
    } else {
      ctx.template = "shop/shop.pug";
    }
    await next();
  })
	.use('/product', productRouter.routes(), productRouter.allowedMethods())
	.use('/manage', manageRouter.routes(), manageRouter.allowedMethods())
  .use('/openStore', openStoreRouter.routes(), openStoreRouter.allowedMethods())
  .use('/cart', cartRouter.routes(), cartRouter.allowedMethods())
  .use('/account', accountRouter.routes(), accountRouter.allowedMethods())
  .use('/bill', billRouter.routes(), billRouter.allowedMethods())
  .use('/order', orderRouter.routes(), orderRouter.allowedMethods())
  .use('/pay', payRouter.routes(), payRouter.allowedMethods())
  .use('/refund', refundRouter.routes(), refundRouter.allowedMethods())
  .use('/cert', certRouter.routes(), certRouter.allowedMethods())
	.use('/store', storeRouter.routes(), storeRouter.allowedMethods());
module.exports = shopRouter;