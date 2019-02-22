const Router = require('koa-router');
const productRouter = new Router();
productRouter
  .get('/:productId', async (ctx, next) => {
    const {data, body, db, params} = ctx;
    // 获取商品id，并检查商品是否存在
    const {productId} = params;
    const product = await db.ShopGoodsModel.findOne({productId});
    if(!product) ctx.throw(404, "商品不存在");
    // 取出商品全部评论
    // 如果商品存在
    data.productInfo = product;
    ctx.template = "shop/product/index.pug";
    await next();
  })
module.exports = productRouter;