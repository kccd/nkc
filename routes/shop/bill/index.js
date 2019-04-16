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
      const billProducts = await db.ShopProductsParamModel.findOne({_id: paraId});
      const newCart = db.ShopCartModel({
        _id: await db.SettingModel.operateSystemID('shopCarts', 1),
        productParamId: paraId,
        productId: billProducts.productId,
        count: productCount,
        uid: user.uid
      })
      await newCart.save();
      const cartsData = [newCart];
      data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData);
      // const billProducts = await db.ShopProductsParamModel.findOne({_id: paraId});
      // const product = await db.ShopGoodsModel.findOne({productId: billProducts[0].productId});
      // if(product.productStatus == "stopsale") ctx.throw(400, "商品停售中，不可购买")
      // data.cartsData = await db.ShopProductsParamModel.extendParamsInfo(billProducts);
      // data.cartsData[0].count = Number(productCount);
      // data.cartsData[0].productParamId = Number(paraId);
      // data.cartsData[0].productParam = await db.ShopProductsParamModel.extendParamsInfo(billProducts[0]);
      // data.cartsData  = billProducts;
    }else{
      billType = "cart";
      cartsId = cartsId.split('-');
      const cartsData = await db.ShopCartModel.find({_id: {$in: cartsId}}); 
      data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData);
    }
    data.billType = billType;

    // 将账单按卖家进行分类
    let newCartData = {}; 
    for(const cart of data.cartsData) {
      const newCartDataUid = cart.product.uid;
      // 计算单个商品运费
      let freightPrice;
      if(cart.product.isFreePost){
        freightPrice = 0;
      }else{
        freightPrice = cart.product.freightPrice.firstFreightPrice + (cart.product.freightPrice.addFreightPrice * (cart.count-1));
      }
      cart.freightPrice = freightPrice;
      // 计算商品价格合计(含运费)
      let productPrice = cart.count * cart.productParam.price
      cart.productPrice = productPrice;
      if(!newCartData[newCartDataUid]) {
        newCartData[newCartDataUid] = {
          user: cart.product.user,
          carts: [cart],
          maxFreightPrice: freightPrice,
          productPrice: productPrice
        }
      } else {
        newCartData[newCartDataUid].carts.push(cart);
        if(freightPrice > newCartData[newCartDataUid].maxFreightPrice) {
          newCartData[newCartDataUid].maxFreightPrice = freightPrice;
        }
        newCartData[newCartDataUid].productPrice += productPrice;
      }
    }
    // 检测限购
    // for(let n in newCartData) {
    //   newCartData[n].carts = await db.ShopGoodsModel.checkOutPurchaseLimit(newCartData[n].carts, user.uid);
    // }
    data.newCartData = newCartData;
    // 计算账单总价格
    // 取出全部收货地址
    let addresses = [];
    const userPersonal = await db.UsersPersonalModel.findOne({"uid":user.uid});
    if(userPersonal){
      addresses = userPersonal.addresses;
    }
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