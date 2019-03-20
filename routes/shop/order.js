const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {page = 0} = query;
		let {orderStatus} = query;
		const {user} = data;
		let storeId = params.account;
		// 构造查询条件
		let searchMap = {
			storeId : "7", 
      uid: user.uid,
      closeStatus: false
		}
		if(orderStatus && orderStatus !== "all"){
			searchMap.orderStatus = orderStatus;
		}
		const count = await db.ShopOrdersModel.count(searchMap);
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;
		const orders = await db.ShopOrdersModel.find(searchMap).sort({orderToc: -1}).skip(paging.start).limit(paging.perpage);
    data.orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
    data.orderStatus = orderStatus;
    ctx.template = '/shop/order/order.pug';
    await next();
  })
  // 查看订单详情
  .get('/detail', async (ctx, next) => {
    const {data, db, params, query, nkcModules} = ctx;
    const {orderId} = query;
    const {user} = data;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(user.uid !== order.uid) ctx.throw(403, "您无权查看此订单");
    if(!order) ctx.throw(400, "订单不存在");
    let orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    data.order = orders[0];
    console.log(data.order)
    ctx.template = '/shop/order/detail.pug';
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
    }
    await next();
  })
  // 取消订单
  .patch('/cancel', async(ctx, next) => {
    const {data, db, query, body} = ctx;
    const {user} = data;
    const {orderId} = body;
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, "订单不存在");
    if(order.uid !== user.uid) ctx.throw(304, "您无权操作该订单");
    await order.update({$set:{"closeStatus":true}});
    await next();
  })
  // 查看物流
  .get('/logistics', async(ctx, next) => {
    const {data, db, query, body, nkcModules} = ctx;
    const {user} = data;
    const {orderId} = query;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, "未找到该订单");
    if(user.uid !== order.uid) ctx.throw(400, "您无权查看该订单的物流信息");
    if(!order.trackNumber) ctx.throw(400, "暂无物流信息");
    let trackNumber = order.trackNumber;
    const trackInfo = await nkcModules.apiFunction.getTrackInfo("3399564142457");
    data.trackNumber = trackNumber;
    data.trackInfo = trackInfo;
    ctx.template = "/shop/order/logistics.pug";
    await next();
  })
  // 确认收货
  .patch('/receipt', async(ctx, next) => {
    const {data, db, query, body} = ctx;
    const {user} = data;
    const {orderId} = body;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, "未找到订单");
    if(user.uid !== order.uid) ctx.throw(400, "您无权操作此订单");
    await order.update({$set:{"orderStatus":"finish"}})
    await next();
  })
module.exports = router;