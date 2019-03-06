const Router = require('koa-router');
const shelfRouter = new Router();
shelfRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
		ctx.template = 'shop/manage/shelf.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, nkcModules, tools} = ctx;
    const {user} = data;
    const {
      productName,
      productDescription,
      productDetails,
      mainForumsId,
      imgIntroductions,
      imgMaster,
      stockCostMethod,
      productStatus,
      shelfTime,
      productParams
    } = body;
    const paramsInfo = body.params;
    const {contentLength} = tools.checkString;
    const store = await db.ShopStoresModel.findOne({uid: user.uid});
    if(!store) ctx.thrwo(404, '您还未开设地摊儿');
    const {storeId} = store;
    if(!productName) ctx.throw(400, '商品名不能为空');
    if(contentLength(productName) > 100) ctx.throw(400, '商品名不能超过100字节');
    if(!productDescription) ctx.throw(400, '商品简介不能为空');
    if(contentLength(productDescription) > 500) ctx.throw(400, '商品简介不能超过500字节');
    if(!productDetails) ctx.throw(400, '商品详细介绍不能为空');
    if(contentLength(productDetails) > 50000) ctx.throw(400, '商品详细介绍不能超过50000字节');
    const accessibleForumsId = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, user);
    await Promise.all(mainForumsId.map(async fid => {
      const forum = await db.ForumModel.findOne({fid});
      if(!forum) ctx.throw(404, `不存在ID为【${fid}】的专业，请重新选择`);
      if(!accessibleForumsId.includes(fid)) {
        ctx.throw(400, `您没有访问专业【${forum.displayName}】的权限，无法在该专业下发布商品`);
      }
    }));
    if(!imgIntroductions.length) ctx.throw(400, '商品图片不能为空');
    await Promise.all(imgIntroductions.map(async rid => {
      const resource = await db.ResourceModel.findOne({rid});
      if(!resource) ctx.throw(400, `图片【${rid}】不存在`);
      if(!['jpg', 'png', 'jpeg'].includes(resource.ext.toLowerCase())) 
        ctx.throw(400, '商品图片只支持jpg、png和jpeg格式');
    }));
    if(!imgMaster) ctx.throw(400, '商品主要图片不能为空');
    if(!imgIntroductions.includes(imgMaster)) ctx.throw(400, '请在已选择的商品图片中选择商品主要图片');
    if(!['payReduceStock', 'payReduceStock'].includes(stockCostMethod)) 
      ctx.throw(400, '库存计数方式错误，仅支持【付款减库存(payReduceStock)】、【下单减库存(orderReduceStock)】');
    if(!['notonshelf', 'insale'].includes(productStatus)) 
      ctx.throw(400, '商品状态设置错误，仅支持【上架(insale)】、【不上架(notonshelf)】');
    if(productStatus === 'insale' && shelfTime && Date.now() >= new Date(shelfTime))
      ctx.throw(400, '商品的上架时间不能早于当前时间，若想立即上架商品请点击【立即上架】按钮'); 
    if(productParams.length === 0) ctx.throw(400, '规格信息不能为空'); 
    if(paramsInfo.length !== 0) {
      let count = paramsInfo[0].values.length;
      for(let i = 1; i < paramsInfo.length; i++) {
        count = count * paramsInfo[i].values.length;
      }
      if(count !== productParams.length) ctx.throw(400, `规格组合缺失，根据输入的规格信息，总组合数应该为${count}。`);
    }
    for(const p of productParams) {
      if(paramsInfo.length !== 0) {
        if(!p.index) ctx.throw(400, '规格索引不能为空');
        const arr = p.index.split('-');
        for(let i = 0; i < arr.length; i++) {
          if(arr[i] >= paramsInfo[i].values.length) 
            ctx.throw(400, `规格组合中的规格索引设置错误，规格【${paramsInfo[i].name}】只有${paramsInfo[i].values.length}个值，而索引值为${arr[i]}`);
        }
      }
      if(p.stocksTotal < 0) ctx.throw(400, '商品库存不能小于0');
      if(!['kcb', 'rmb', 'all'].includes(p.payMethod)) ctx.throw(400, '付款方式选择错误');
      if(!ctx.permission('setRMBpayment') && p.payMethod === 'rmb')
        ctx.throw(400, '您没有设置商品只能通过人名币付款的权限');
      if(p.originPrice < 0) ctx.throw(400, '商品原价不能小于0');
      if(!p.useDiscount) p.price = p.originPrice;
      else {
        if(p.originPrice <= p.price) ctx.throw(400, '商品优惠价必须小于商品原价');
      }
    }

    const productId = await db.SettingModel.operateSystemID('shopGoods', 1);  
    const product = db.ShopGoodsModel({
      productId,
      productName,
      productDescription,
      productDetails,
      mainForumsId,
      imgIntroductions,
      imgMaster,
      stockCostMethod,
      productStatus,
      shelfTime,
      storeId,
      params: paramsInfo,
      uid: user.uid
    });
    for(const p of productParams) {
      p.productId = productId;
      p.uid = user.uid;
      p.stocksSurplus = p.stocksTotal;
      p._id = await db.SettingModel.operateSystemID('shopProductsParams', 1);
      const d = db.ShopProductsParamModel(p);
      await d.save();
    }
    await product.save();
		await next();
	})
module.exports = shelfRouter;