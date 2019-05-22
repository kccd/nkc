const Router = require('koa-router');
const mime = require('mime');
const fs = require('fs');
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
    data.carouselItems = data.homeSetting.carousels;
    ctx.template = "experimental/shop/homeSetting/carousel.pug";
		await next();
  })
  .post('/carousel', async (ctx, next) => {
    const {data, db, tools, body} = ctx;
    const {file} = body.files;
    const {targetUrl} = body.fields;
	  if(!file) ctx.throw(400, 'no file uploaded');
	  const {path, type, size, name} = file;
	  if(size > ctx.settings.upload.sizeLimit.photo) ctx.throw(400, '图片不能超过20M');
	  const extArr = ['jpg', 'jpeg', 'png'];
	  const {imageMagick} = tools;
	  const extension = mime.getExtension(type);
	  if(!extArr.includes(extension)) {
		  ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.');
    }
    let shopCarouselPath = "public/statics/carousels"
	  const targetFile = shopCarouselPath + '/' + name;
    await fs.renameSync(path, targetFile);
    let obj = {
      targetUrl: targetUrl,
      name: name,
    }
    let homeSetting = data.homeSetting;
    const featuredIndex = homeSetting.carousels.indexOf(obj);
    homeSetting.carousels.push(obj);
    await homeSetting.update({carousels: homeSetting.carousels});
    data.homeSetting = homeSetting;
    await next();
  })
  .patch('/carousel', async (ctx, next) => {
    const {data, body} = ctx;
    const {index} = body;
    let homeSetting = data.homeSetting;
    homeSetting.carousels.splice(index, 1);
    await homeSetting.update({carousels: homeSetting.carousels});
    data.homeSetting = homeSetting;
    await next();
  })
  .get('/featured', async (ctx, next) => {
    const {data, db} = ctx;    
    // 取出精选商品并拓展详细信息(取出的结果按id大小进行了重新排序)
    let featuredItems = await db.ShopGoodsModel.find({productId:{$in:data.homeSetting.featureds}});
    featuredItems = await db.ShopGoodsModel.extendProductsInfo(featuredItems);
    // await Promise.all(featuredItems.map(async featured => {
    //   let store = await db.ShopStoresModel.findOne({storeId: featured.storeId});
    //   if(store){
    //     featured.storeName = store.storeName;
    //   }else {
    //     featured.storeName = "";
    //   }
    // }));
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
  .get('/recommendation', async (ctx, next) => {
    const {data, query, db, params, body} = ctx;
    const recommendationItems = await db.ShopStoresModel.find({storeId: {$in:data.homeSetting.recommendations}});
    data.recommendationItems = recommendationItems;
    ctx.template = "experimental/shop/homeSetting/recommendation.pug";
    await next();
  })
  .post('/recommendation', async (ctx, next) => {
    const {data, query, db, params, body} = ctx;
    const {type} = body;
    // 添加推荐店铺
    if(type == "add") {
      const {storeId} = body;
      const store = await db.ShopStoresModel.findOne({storeId});
      if(!store) ctx.throw(400, "店铺不存在");
      let homeSetting = data.homeSetting;
      const recommendationIndex = homeSetting.recommendations.indexOf(storeId);
      if(recommendationIndex < 0){
        homeSetting.recommendations.push(storeId);
        await homeSetting.update({recommendations: homeSetting.recommendations});
        data.homeSetting = homeSetting;
      }else {
        ctx.throw(400, "店铺已在推荐列表中")
      }
    }else if(type == "del") {
      const {storeId} = body;
      const store = await db.ShopStoresModel.findOne({storeId});
      if(!storeId) ctx.throw(400, "店铺不存在");
      let homeSetting = data.homeSetting;
      await homeSetting.update({$pull:{recommendations:storeId}})
    }
    await next();
  })
  .get('/popular', async(ctx, next) => {
    const {data, query, db, params, body} = ctx;
    let popularItems = await db.ShopGoodsModel.find({productId:{$in:data.homeSetting.populars}});
    data.popularItems = await db.ShopGoodsModel.extendProductsInfo(popularItems);
    ctx.template = "experimental/shop/homeSetting/popular.pug"
    await next();
  })
  .post('/popular', async(ctx, next) => {
    const {data, query, db, params, body} = ctx;
    const {type} = body;
    // 添加热门商品
    if(type == "add") {
      const {productId} = body;
      const product = await db.ShopGoodsModel.findOne({productId});
      if(!product) ctx.throw(400, "商品不存在");
      let homeSetting = data.homeSetting;
      const featuredIndex = homeSetting.populars.indexOf(productId);
      if(featuredIndex < 0){
        homeSetting.populars.push(productId);
        await homeSetting.update({populars: homeSetting.populars});
        data.homeSetting = homeSetting;
      }else {
        ctx.throw(400, "商品已在精选列表中")
      }
    }else if(type == "del") {
      const {productId} = body;
      const product = await db.ShopGoodsModel.findOne({productId});
      if(!productId) ctx.throw(400, "商品不存在");
      let homeSetting = data.homeSetting;
      await homeSetting.update({$pull:{populars:productId}})
    }
    await next();
  })
module.exports = homeSettingRouter;