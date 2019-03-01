const Router = require('koa-router');
const homeSettingRouter = new Router();
homeSettingRouter
  .use('/', async (ctx, next) => {
    const {db, data} = ctx;
    let homeSetting = await db.ShopSettingsModel.findOne({type:"homeSetting"});
    if(!homeSetting) {
      const fields = {
        type: "homeSetting",
        carousels: [],
        featureds: []
      }
      homeSetting = db.ShopSettingsModel(fields);
      await homeSetting.save();
    }
    data.homeSetting = homeSetting;
    await next();
  })
	.get('/carousel', async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = "experimental/shop/homeSetting/carousel.pug";
		await next();
  })
  .get('/featured', async (ctx, next) => {
    const {data, db} = ctx;    
    // 取出精选商品并拓展详细信息(取出的结果按id大小进行了重新排序)
    let featuredItems = await db.ShopGoodsModel.find({productId:{$in:data.homeSetting.featureds}});
    await Promise.all(featuredItems.map(async featured => {
      let store = await db.ShopStoresModel.findOne({storeId: featured.storeId});
      if(store){
        featured.storeName = store.storeName;
      }else {
        featured.storeName = "";
      }
    }));
    data.featuredItems = featuredItems;
    ctx.template = "experimental/shop/homeSetting/featured.pug";
    await next();
  })
  .post('/featured', async (ctx, next) => {
    const {data, query, db, params, body} = ctx;
    const {type} = body;
    // 添加精选商品
    if(type == "add") {
      const {productId} = body;
      const product = await db.ShopGoodsModel.findOne({productId});
      if(!product) ctx.throw(400, "商品不存在");
      let homeSetting = data.homeSetting;
      const featuredIndex = homeSetting.featureds.indexOf(productId);
      if(featuredIndex < 0){
        homeSetting.featureds.push(productId);
        await homeSetting.update({featureds: homeSetting.featureds});
        data.homeSetting = homeSetting;
      }else {
        ctx.throw(400, "商品已在精选列表中")
      }
    }else if(type == "del") {
      const {productId} = body;
      const product = await db.ShopGoodsModel.findOne({productId});
      if(!productId) ctx.throw(400, "商品不存在");
      let homeSetting = data.homeSetting;
      await homeSetting.update({$pull:{featureds:productId}})
    }
    await next();
  })
module.exports = homeSettingRouter;