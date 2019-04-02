const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    let {cartsId, paraId, productCount} = query;
    let billType;
    paraId = Number(paraId);
    if(!cartsId){
      billType = "product";
      if(!productCount) ctx.throw(400, "请选择商品数量");
      if(!paraId) ctx.throw(400, "请选择商品");
      const billProducts = await db.ShopProductsParamModel.find({_id: paraId});
      data.cartsData = await db.ShopProductsParamModel.extendParamsInfo(billProducts);
      data.cartsData[0].count = productCount;
      // data.cartsData  = billProducts;
    }else{
      billType = "cart";
      cartsId = cartsId.split('-');
      const cartsData = await db.ShopCartModel.find({_id: {$in: cartsId}}); 
      data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData);
    }
    // 检测限购
    data.cartsData = await db.ShopGoodsModel.checkOutPurchaseLimit(data.cartsData, user.uid);
    data.billType = billType;

    // 取出全部收货地址
    let addresses = [];
    const userPersonal = await db.UsersPersonalModel.findOne({"uid":user.uid});
    if(userPersonal){
      addresses = userPersonal.addresses;
    }
    console.log(data.cartsData);
    data.addresses = addresses;
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