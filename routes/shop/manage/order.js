const Router = require('koa-router');
const orderRouter = new Router();
const refundRouter = require("./refund");
const cancelRouter = require("./cancel");

orderRouter
	.use('/', async (ctx, next) => {
		const {data} = ctx;
		data.active = "order";
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {page = 0} = query;
		let {orderStatus} = query;
		const {user} = data;
		// 构造查询条件
		let searchMap = {
			sellUid : user.uid
		}
		if(orderStatus == "refunding"){
			searchMap.refundStatus = "ing";
		}else if(orderStatus && orderStatus !== "all" && orderStatus !== "close"){
			searchMap.orderStatus = orderStatus;
		}else if(orderStatus == "close") {
			searchMap.closeStatus = true;
		}
		const count = await db.ShopOrdersModel.count(searchMap);
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;
		const orders = await db.ShopOrdersModel.find(searchMap).sort({orderToc: -1}).skip(paging.start).limit(paging.perpage);
    data.orders = await db.ShopOrdersModel.storeExtendOrdersInfo(orders);
		data.orders = await db.ShopOrdersModel.translateOrderStatus(data.orders);
		data.orderStatus = orderStatus;
		ctx.template = 'shop/manage/order.pug';
		await next();
	})
	// 发货
	.patch('/sendGoods', async(ctx, next) => {
		const {data, db, params, query, body} = ctx;
		const {orderId, trackNumber, trackName} = body.post;
		if(!orderId || !trackNumber) ctx.throw(400, "请填写快递单号");
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(400, "订单无效");
    var time = new Date();
    const shopSettings = await db.SettingModel.findOnly({_id: "shop"});
    const autoReceiveTime = Date.now() + shopSettings.c.refund.buyerReceive * 60 * 60 * 1000;
		await order.update({$set: {trackName:trackName,trackNumber:trackNumber, orderStatus:"unSign", shipToc:time, autoReceiveTime}});
		await db.MessageModel.sendShopMessage({
      type: "shopSellerShip",
      r: order.buyUid,
      orderId: order.orderId
    });
		await next();
	})
	// 无物流发货
	.patch('/sendGoodsNoLog', async(ctx, next) => {
		const {data, db, params, query, body} = ctx;
		const {orderId} = body.post;
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(400, "订单无效");
    var time = new Date();
    const shopSettings = await db.SettingModel.findOnly({_id: "shop"});
    const autoReceiveTime = Date.now() + shopSettings.c.refund.buyerReceive * 60 * 60 * 1000;
		await order.update({$set: {trackName:"",trackNumber:"no", orderStatus:"unSign", shipToc:time, autoReceiveTime}});
		await next();
	})
  // 修改订单价格
  .patch('/editOrder', async(ctx, next) => {
    const {data, db, query, body} = ctx;
    const {user} = data;
    const {orderId, price} = body.post;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(400, "未找到订单");
		let orders = await db.ShopOrdersModel.storeExtendOrdersInfo([order]);
		data.order = orders[0];
    if(user.uid !== data.order.sellUid) ctx.throw(400, "您无权修改此订单价格");
    await order.update({$set:{"orderPrice":price}});
    await next();
	})
	.patch('/editOrderTrackNumber', async(ctx, next) => {
		const {data, db, query, body} = ctx;
		const {user} = data;
		const {orderId, trackNumber} = body;
		if(!orderId) ctx.throw(400, "订单号有误");
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order || order.orderStatus !== "unSign" || order.closeStatus == true || order.refundStatus == "success") ctx.throw(400, "该状态订单不可修改运单号");
		await order.update({$set: {"trackNumber":trackNumber}});
		await next();
	})
	// 查看订单详情
	.get('/detail', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {user} = data;
		const {orderId} = query;
		if(!orderId) ctx.throw(400, "订单号有误");
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(404, "未找到订单");
		let orders = await db.ShopOrdersModel.storeExtendOrdersInfo([order]);
		data.order = orders[0];
		// 获取订单凭证
		const certs = await db.ShopCertModel.find({orderId});
		data.certs = certs;
    // 获取订单关闭原因
    const refund = await db.ShopRefundModel.findOne({orderId}).sort({_id:-1}).limit(1);
    if(refund) {
      refund.description = ctx.state.lang("shopRefundStatus", refund.status) || refund.status;
    }
    data.refund = refund;
		if(data.order.sellUid !== user.uid) ctx.throw(400, "您无权查看此订单详情");
		ctx.template = 'shop/manage/detail.pug';
		await next();
	})
	// 查看订单物流详情
	.get('/logositics', async (ctx, next) => {
		const {data, db, query, body, nkcModules} = ctx;
		const {user} = data;
		const {orderId} = query;
		if(!orderId) ctx.throw(400, "订单号有误");
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(400, "未找到该订单");
		if(user.uid !== order.sellUid) ctx.throw(400, "您无权查看该订单的物流信息");
		if(!order.trackNumber) ctx.throw(400, "暂无物流信息");
		let trackNumber = order.trackNumber;
		let trackName = order.trackName;
		if(trackName == "SFEXPRESS" && order.receiveMobile) {
			trackNumber = trackNumber + ":" + order.receiveMobile.substring(order.receiveMobile.length -2,order.receiveMobile.length)
		}
		const trackInfo = await nkcModules.apiFunction.getTrackInfo(trackNumber, trackName);
		data.trackNumber = trackNumber;
		data.trackInfo = trackInfo;
		ctx.template = "/shop/manage/logositics.pug";
		await next();
	})
	// 修改订单卖家备注
	.patch('/editSellMessage', async (ctx, next) => {
		const {data, body, query, db} = ctx;
		const {sellMessage, orderId} = body;
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(400, "未找到该订单");
		if(sellMessage.length == 0) ctx.throw(400, "卖家备注不可为空");
		await order.update({$set: {"sellMessage":sellMessage}});
		await next();
	})
	// 修改购买记录中的价格
	.patch('/editCostRecord', async (ctx, next) => {
		const {data, body, query, db} = ctx;
		const {costId, orderId, costObj, orderObj} = body;
		// 找出购买记录并修改
		const costRecord = await db.ShopCostRecordModel.findOne({costId});
		if(!costRecord) ctx.throw(400, "商品规格未找到");
		const {count, singlePrice} = costObj;
		await costRecord.update({$set: {count, singlePrice}});
		// 找出订单并修改
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(400, "订单未找到");
		const {orderFreightPrice, orderPrice} = orderObj;
		await order.update({$set: {orderFreightPrice, orderPrice}});
		await next();
	})
	// 修改购买订单中的价格
	.patch('/editOrderPrice', async (ctx, next) => {
		const {data, body, query, db} = ctx;
		const {orderId, orderObj} = body;
		// 找出订单并修改
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(400, "订单未找到");
		const {orderFreightPrice, orderPrice} = orderObj;
		await order.update({$set: {orderFreightPrice, orderPrice}})
		await next();
	})
	// 订单导出
	.get('/orderListToExcel', async (ctx, next) => {
		const {data, body, db, query} = ctx;
		const {user} = data;
		const {orderStartStamp, orderEndStamp} = query;
		let searchMap = {sellUid:user.uid};
		if(orderStartStamp && orderEndStamp) {
			searchMap = {orderToc: {$gt:orderStartStamp, $lt: orderEndStamp}, sellUid:user.uid}
		}
		// 订单数据查询
		let orderLists = await db.ShopOrdersModel.find(searchMap);
		data.orderLists = await db.ShopOrdersModel.storeExtendOrdersInfo(orderLists);
		data.orderLists = await db.ShopOrdersModel.translateOrderStatus(data.orderLists);
		ctx.template = "/shop/manage/orderList.pug";
		await next();
	})
  .use("/cancel", cancelRouter.routes(), cancelRouter.allowedMethods())
  .use("/refund", refundRouter.routes(), refundRouter.allowedMethods());
module.exports = orderRouter;