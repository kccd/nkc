const Router = require('koa-router');
const router = new Router();
router
  // 提交订单，并跳转到支付
  .post('/', async (ctx, next) => {
    const {data, db, query, body} = ctx;
    const {user} = data;
    const {post, payMethod} = body;
    // 取出全部paid
    let paids = [];
    for(let bill of post) {
      // 获取对应规格商品
      let productParams = await db.ShopProductsParamModel.find({_id: bill.paraId});
      productParams = await db.ShopProductsParamModel.extendParamsInfo(productParams);
      let productParam = productParams[0];
      // 检查库存
      let stockCostMethod = productParam.product.stockCostMethod;
      let stocksSurplus = productParam.stocksSurplus;
      if(Number(bill.productCount) > Number(stocksSurplus)) ctx.throw(400, "库存不足");
      // 是否为下单减库存
      if(stockCostMethod == "orderReduceStock") {
        await db.ShopProductsParamModel.update({_id:productParam._id},{$set:{stocksSurplus:(Number(stocksSurplus) - Number(bill.productCount))}});
      }
      const orderId = await db.SettingModel.operateSystemID('shopOrders', 1);
      const order = db.ShopOrdersModel({
        orderId: orderId,
        storeId: productParam.product.storeId,
        productId: productParam.productId,
        paramId: productParam._id,
        uid: user.uid,
        count: bill.productCount,
        orderOriginPrice: productParam.price * bill.productCount,
        orderPrice: productParam.price * bill.productCount
      });
      await order.save();
    }
    await next();
  })
module.exports = router;