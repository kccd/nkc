const Router = require('koa-router');
const goodslistRouter = new Router();
goodslistRouter
	.get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
    const storeId = params.account;
    const products = await db.ShopGoodsModel.find({storeId});
    data.products = await db.ShopGoodsModel.extendProductsInfo(products);
		ctx.template = 'shop/manage/goodslist.pug';
		await next();
  })
  // 访问规格重新编辑页面
  .get('/editParam', async (ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    const {paraId} = query;
    if(!paraId) ctx.throw(400, "商品规格有误");
    // 获取对应规格商品
    let productParams = await db.ShopProductsParamModel.find({_id: paraId});
    productParams = await db.ShopProductsParamModel.extendParamsInfo(productParams);
    data.productParam = productParams[0];
    ctx.template = "shop/manage/goodsParamEdit.pug"
    await next();
  })
  // 提交规格修改信息
  .patch('/editParam', async (ctx, next) => {
    const {data, params, db, nkcModules, body} = ctx;
    const {paraId, originPrice, price, stocksTotal} = body.obj;
    const productParam = await db.ShopProductsParamModel.findOne({_id:paraId});
    if(!productParam) ctx.throw(400, "找不到该商品规格");
    // 取出剩余库存，并重新计算
    let {stocksSurplus} = productParam;
    stocksSurplus += Number(stocksTotal);
    await productParam.update({$set:{originPrice, price, stocksSurplus, stocksTotal}})
    await next();
  })
  // 访问商品重新编辑页面
  .get('/editProduct', async (ctx, next) => {
    const {data, body, query, params, db} = ctx;
    ctx.throw(404, "该路由暂不可访问")
    const {productId} = query;
    if(!productId) ctx.throw(400, "商品Id有误");
    let product = await db.ShopGoodsModel.findOne({productId});
    if(!product) ctx.throw(400, "商品不存在");
    data.product = await db.ShopGoodsModel.extendProductsInfo([product]);
    await next();
  })
  // 提交商品修改信息
  .patch('/editProduct', async (ctx, next) => {
    const {data, body, query, params, db} = ctx;
    await next();
  })
module.exports = goodslistRouter;