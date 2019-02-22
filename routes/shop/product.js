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
    let c;
    if(product){
      c = product.productDetails;
    }
    const post = {
      c:c,
      l:'html'
    }
    product.productDetails = ctx.nkcModules.nkc_render.experimental_render(post);
    data.productInfo = product;
    ctx.template = "shop/product/index.pug";
    await next();
  })
module.exports = productRouter;