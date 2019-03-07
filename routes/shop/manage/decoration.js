const Router = require('koa-router');
const decorationRouter = new Router();
const mime = require('mime');
const fs = require('fs');
decorationRouter
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const storeId = params.account;
		let store = await db.ShopStoresModel.findOne({storeId});
		if(store) {
			var locationArray = store.address.split("&");
			store.location = locationArray[0];
			store.address = locationArray[1];
		}
    data.store = store;
    let storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    if(!storeDecoration) {
      storeDecoration = new db.ShopDecorationsModel({storeId:storeId});
      storeDecoration.save();
    }
    data.storeDecoration = storeDecoration;

    let featuredProducts = await db.ShopGoodsModel.find({productId:{$in:storeDecoration.storeLeftFeatureds}})
    data.featuredProducts = featuredProducts;
    // 获取分类推荐
    // console.log(storeDecoration.storeClassFeatureds)
    data.storeClassFeatureds = await Promise.all(storeDecoration.storeClassFeatureds.map(async classify => {
      let classFeatureds = await db.ShopGoodsModel.find({productId:{$in:classify.productsArr}});
      classify.classFeatureds = classFeatureds;
      return classify
    }))
    // data.products = await Promise.all(data.products.map(async product => {
    //   product = product.toObject();
    //   if(storeLeftFeatureds.indexOf(product.productId) > -1){
    //     product.isFeatured = true;
    //   }else{
    //     product.isFeatured = false;
    //   }
    //   return product;
    // }));
		ctx.template = 'shop/manage/decoration.pug';
		await next();
	})
	// .post('/', async (ctx, next) => {
  //   const {data, db, body, params} = ctx;
	// 	const {user} = data;
	// 	// 验证是否有操作该店铺的权限
  //   // 待定
  //   console.log("走了这里")
	// 	const {location, storeDescription, storeName} = body;
	// 	const storeId = params.account;
	// 	let store = await db.ShopStoresModel.findOne({storeId});
	// 	if(!store || storeId !== store.storeId) ctx.throw(400, "您无对该店铺的管理权限");
	// 	// let addressArray = [];
	// 	// addressArray.push(location)
	// 	await next();
  // })
  .post('/sign', async(ctx, next) => {
    const {data, body, params, db, query} = ctx;
    const {account} = params;
    let storeId = account;
		const {user} = data;
		const {file} = body.files;
	  if(!file) ctx.throw(400, 'no file uploaded');
	  const {path, type, size} = file;
	  if(size > ctx.settings.upload.sizeLimit.photo) ctx.throw(400, '图片不能超过20M');
	  const extArr = ['jpg', 'jpeg', 'png'];
	  const extension = mime.getExtension(type);
	  if(!extArr.includes(extension)) {
		  ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.');
	  }
	  const saveName = "storeLogo" + storeId + '.jpg';
    // const {shopLogoPath} = settings.upload;
    let shopLogoPath = "public/statics/storeLogo"
	  const targetFile = shopLogoPath + '/' + saveName;
    await fs.renameSync(path, targetFile);
    const storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    await storeDecoration.update({$set:{storeSignImage:true}});
		await next(); 
  }) 
  .post('/service', async (ctx, next) => {
    const {data, body, params, db, query} = ctx;
    const storeId = params.account;
    const {serviceTimeWork, serviceTimeRest, serviceMobile, servicePhone} = body;
    const storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    await storeDecoration.update({$set:{serviceTimeWork, serviceTimeRest, serviceMobile, servicePhone}})
		await next(); 
  })
  .post('/search', async (ctx, next) => {
    const {data, body, params, db, query} = ctx;
    const storeId = params.account;
    const {presetKey, recommendKeys} = body;
    const storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    await storeDecoration.update({$set:{presetKey, recommendKeys}});
    await next();
  })
  // 获取全部商品
  .use('/', async (ctx, next) => {
    const {data, db, params} = ctx;
    const storeId = params.account;
    const products = await db.ShopGoodsModel.find({storeId});
    data.products = products;
    await next();
  })
  .get('/featured', async (ctx, next) => {
    const {data, params, db} = ctx;
    const storeId = params.account;
    let products = data.products;
    let storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    let storeLeftFeatureds = storeDecoration.storeLeftFeatureds;
    data.storeLeftFeatureds = storeLeftFeatureds;
    data.products = await Promise.all(data.products.map(async product => {
      product = product.toObject();
      if(storeLeftFeatureds.indexOf(product.productId) > -1){
        product.isFeatured = true;
      }else{
        product.isFeatured = false;
      }
      return product;
    }));
    await next();
  })
  .post('/featured', async (ctx, next) => {
    const {data, params, body, db} = ctx;
    const storeId = params.account;
    let storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    const {arr} = body;
    await storeDecoration.update({$set:{storeLeftFeatureds: arr}})
    await next();
  })
  .patch('/addClass', async (ctx, next) => {
    const {data, params, body, db} = ctx;
    const storeId = params.account;
    const {newClassName} = body;
    let storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    // 做查询，如果分类名字已经存在，则不予添加
    let newClassObj = {
      name: newClassName,
      productsArr:[]
    }
    storeDecoration.storeClassFeatureds.push(newClassObj);
    await db.ShopDecorationsModel.update({$set:{storeClassFeatureds:storeDecoration.storeClassFeatureds}});
    await next();
  })
  .get('/singleClass', async (ctx, next) => {
    const {data, params, body, db, query} = ctx;
    const {index} = query;
    const storeId = params.account;

    let products = data.products;
    let storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    let storeClassFeatureds = storeDecoration.storeClassFeatureds[index];
    data.storeClassFeatureds = storeClassFeatureds;
    data.classProducts = await Promise.all(data.products.map(async product => {
      product = product.toObject();
      if(storeClassFeatureds.productsArr.indexOf(product.productId) > -1){
        product.isFeatured = true;
      }else{
        product.isFeatured = false;
      }
      return product;
    }));

    await next();
  })
  .patch('/addSingleClass', async (ctx, next) => {
    const {data, params, body, db, query} = ctx;
    const {index, arr} = body;
    const storeId = params.account;
    let storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    storeDecoration.storeClassFeatureds[index].productsArr = arr;
    await db.ShopDecorationsModel.update({$set:{storeClassFeatureds:storeDecoration.storeClassFeatureds}});
    await next();
  })
  .patch('/delClass', async(ctx, next) => {
    const {data, params, body, db, query} = ctx;
    const storeId = params.account;
    const {index} = body;
    let storeDecoration = await db.ShopDecorationsModel.findOne({storeId});
    storeDecoration.storeClassFeatureds.splice(index, 1);
    await db.ShopDecorationsModel.update({$set:{storeClassFeatureds:storeDecoration.storeClassFeatureds}});
    await next();
  })
module.exports = decorationRouter;