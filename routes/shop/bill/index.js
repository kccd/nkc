const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    let {cartsId, paraId, productCount} = query;
    let billType;
    paraId = Number(paraId);
    if(!cartsId){
      billType = "product";
      if(!productCount) ctx.throw(400, "请选择商品数量");
      if(!paraId) ctx.throw(400, "请选择商品")
      const billProducts = await db.ShopProductsParamModel.find({_id: paraId})
      data.cartsData = await db.ShopProductsParamModel.extendParamsInfo(billProducts);
      data.cartsData[0].count = productCount;
      // data.cartsData  = billProducts;
    }else{
      billType = "cart";
      cartsId = cartsId.split('-');
      const cartsData = await db.ShopCartModel.find({_id: {$in: cartsId}}); 
      data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData);
    }
    data.billType = billType;
    ctx.template = 'shop/bill/bill.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, query, body} = ctx;
    const {paraId, productCount} = body.post;
    ctx.template = 'shop/bill/bill.pug';
    await next();
  })
module.exports = router;