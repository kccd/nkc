const Router = require('koa-router');
const router = new Router();
router
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {productId} = body;
    const product = await db.ShopGoodsModel.findOne({productId});
    if(!product) ctx.throw(400, '添加失败，商品不存在或已下架');
    await next();
  });
module.exports = router;