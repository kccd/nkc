const Router = require('koa-router');
const router = new Router();
const singleOrderRouter = require('./singleOrder');
router
  .get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {page = 0} = query;
		let {orderStatus} = query;
		const {user} = data;
		let storeId = params.account;
		// 构造查询条件
		let searchMap = {
			// storeId : "7", 
      uid: user.uid,
      closeStatus: false
		}
		if(orderStatus && orderStatus !== "all"){
			searchMap.orderStatus = orderStatus;
		}
    const count = await db.ShopOrdersModel.count(searchMap);
		const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    const sort = {};
    if(orderStatus !== 'unCost') {
      sort.payToc = -1;
    } else {
      sort.orderToc = -1;
    }
		const orders = await db.ShopOrdersModel.find(searchMap).sort(sort).skip(paging.start).limit(paging.perpage);
    data.orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
    data.orderStatus = orderStatus;
    ctx.template = '/shop/order/order.pug';
    await next();
  })
  // 提交订单，并跳转到支付
  .post('/', async (ctx, next) => {
    const {data, db, query, body} = ctx;
    const {user} = data;
    const {post, receInfo} = body;
    const {receiveAddress, receiveName, receiveMobile, payMethod} = receInfo;

    // 取出全部paid
    let paids = [];
    const ordersId = [];
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
        receiveAddress: receiveAddress,
        receiveName: receiveName,
        receiveMobile: receiveMobile,
        storeId: productParam.product.storeId,
        productId: productParam.productId,
        paramId: productParam._id,
        uid: user.uid,
        count: bill.productCount,
        orderOriginPrice: productParam.price * bill.productCount,
        orderPrice: productParam.price * bill.productCount
      });
      await order.save();
      ordersId.push(order.orderId);
    }
    data.ordersId = ordersId.join('-');
    await next();
  })
  .use('/:orderId', singleOrderRouter.routes(), singleOrderRouter.allowedMethods());
module.exports = router;