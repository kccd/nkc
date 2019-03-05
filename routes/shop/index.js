const Router = require('koa-router');
const shopRouter = new Router();
const productRouter = require('./product');
const manageRouter = require('./manage');
const openStoreRouter = require('./openStore');
const storeRouter = require('./store');
const accountRouter = require('./account');
const cartRouter = require('./cart');
shopRouter
  .get('/', async (ctx, next) => {
    const {data, db ,query, params} = ctx;
    const homeSetting = await db.ShopSettingsModel.findOne({type:"homeSetting"});
    // 取出精选商品
    let featuredItems = await db.ShopGoodsModel.find({productId:{$in:homeSetting.featureds}});
    await Promise.all(featuredItems.map(async featured => {
      let store = await db.ShopStoresModel.findOne({storeId: featured.storeId});
      if(store){
        featured.storeName = store.storeName;
      }else {
        featured.storeName = "";
      }
    }));
    data.featuredItems = featuredItems;
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
	.use('/store', storeRouter.routes(), storeRouter.allowedMethods())
module.exports = shopRouter;