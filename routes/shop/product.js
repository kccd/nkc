const Router = require('koa-router');
const productRouter = new Router();
productRouter
  .get('/:productId', async (ctx, next) => {
    const {data, body, db, params, query, nkcModules} = ctx;
    // 获取商品id，并检查商品是否存在
    const {productId} = params;
    let {paraId} = query;
    const products = await db.ShopGoodsModel.find({productId});
    if(products.length == 0) ctx.throw(400, "商品不存在");
    const productArr = await db.ShopGoodsModel.extendProductsInfo(products);
    const product = productArr[0];
    if(product) {
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/t/${product.tid}`))
    }else{
      return ctx.throw(400,"商品不存在")
    }
    // data.product = product;
    // // 选定规格
    // let paId = 0;
    // for(let a=0;a<product.productParams.length;a++){
    //   if(paraId == product.productParams[a]._id){
    //     paId = a;
    //   }
    // }
    // data.paId = paId;
    // data.paraId = paraId;
    // // 取出全部评论
    // let match = {
    //   tid: data.product.tid,
    //   pid: {$nin:[data.product.oc]},
    //   disabled: false
    // }
    // const posts = await db.PostModel.find(match);
    // data.posts = await db.PostModel.extendPosts(posts, {uid: data.user?data.user.uid: ''});
    // // 获取用户地址信息
    // let userAddress = "";
    // if(data.user){
    //   let ipInfo = await nkcModules.apiFunction.getIpAddress(ctx.address);
    //   const {status, province, city} = ipInfo;
    //   if(status && status == "1"){
    //     userAddress = province + " " + city;
    //   }
    // }
		// data.userAddress = userAddress;
    // ctx.template = "shop/product/index.pug";
    await next();
  })
  .patch('/:productId/changePara', async (ctx, next) => {
    const {data, body, db, params} = ctx;
    const {paraId} = body;
    const {productId} = params;
    const productParams = await db.ShopProductsParamModel.findOne({_id:paraId});
    if(!productParams) ctx.throw(400, "规格查询失败");
    const product = await db.ShopGoodsModel.findOnly({productId});
    data.productParams = productParams;
    if(product.vipDiscount && data.user) {
      const gradeId = data.user.grade._id;
      let vipNum = 100;
      for(const v of product.vipDisGroup) {
        if((v.vipLevel + 1) === gradeId) {
          vipNum = v.vipNum;
        }
      }
      data.productParams.price = data.productParams.price * (vipNum/100);
    }
    await next();
  })
  // 商品禁售,权限分配给管理员
  .patch('/:productId/banSale', async (ctx, next) => {
		const {db, body} = ctx;
		const {productId} = body;
		const product = await db.ShopGoodsModel.findOne({productId: productId});
		if(product) {
			await product.update({$set: {adminBan:true}});
		}
		await next();
  })
  .post("/:productId/top", async(ctx, next) => {
    const {params, db} = ctx;
    const {productId} = params;
    const product = await db.ShopGoodsModel.findOnly({productId});
    const homeSettings = await db.SettingModel.getSettings("home");
    if(homeSettings.shopGoodsId.includes(product.productId)) ctx.throw(400, "商品已经被推动到首页了");
    homeSettings.shopGoodsId.unshift(productId);
    await db.SettingModel.updateOne({_id: "home"}, {
      $set: {
        "c.shopGoodsId": homeSettings.shopGoodsId
      }
    });
    await db.SettingModel.saveSettingsToRedis("home");
    await next();
  })
  .del("/:productId/top", async (ctx, next) => {
    const {params, db} = ctx;
    const {productId} = params;
    const product = await db.ShopGoodsModel.findOnly({productId});
    const homeSettings = await db.SettingModel.getSettings("home");
    if(!homeSettings.shopGoodsId.includes(product.productId)) ctx.throw(400, "商品未被推动到首页");
    homeSettings.shopGoodsId.unshift(productId);
    await db.SettingModel.updateOne({_id: "home"}, {
      $pull: {
        "c.shopGoodsId": productId
      }
    });
    await db.SettingModel.saveSettingsToRedis("home");
    await next();
  });
module.exports = productRouter;