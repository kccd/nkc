const Router = require('koa-router');
const productRouter = new Router();
productRouter
  .get('/:productId', async (ctx, next) => {
    const {data, body, db, params, query} = ctx;
    // 获取商品id，并检查商品是否存在
    const {productId} = params;
    const {paraId} = query;
    const products = await db.ShopGoodsModel.find({productId});
    if(products.length == 0) ctx.throw(400, "商品不存在");
    const productArr = await db.ShopGoodsModel.extendProductsInfo(products);
    const product = productArr[0];
    data.product = product;
    // // 选定规格
    // let paraId = "";
    // for(let para of product.productParams){
    //   if(paraId == para._id){
    //     paraId = para._id;
    //   }
    // }
    ctx.template = "shop/product/index.pug";
    await next();
  })
module.exports = productRouter;