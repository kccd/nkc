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
      if(storeLeftFeatureds.indexOf(product.storeId) > -1){
        product.isFeatured = true;
      }else{
        product.isFeatured = false;
      }
      return product;
    }));
    await next();
  })
module.exports = decorationRouter;