const Router = require('koa-router');
const orderRouter = new Router();
const refundRouter = require("./refund");
orderRouter
	.get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {page = 0} = query;
		let {orderStatus} = query;
		data.orderStatus = orderStatus;
		const {user} = data;
		let storeId = params.account;
		// 构造查询条件
		let searchMap = {
			storeId : storeId, 
			uid: user.uid
		}
		if(orderStatus && orderStatus !== "all"){
			searchMap.orderStatus = orderStatus;
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
		const {orderId, trackNumber} = body.post;
		if(!orderId || !trackNumber) ctx.throw(400, "请填写快递单号");
		const order = await db.ShopOrdersModel.findOne({orderId});
		if(!order) ctx.throw(400, "订单无效");
		var time = new Date();
		await order.update({$set: {trackNumber:trackNumber, orderStatus:"unSign", shipToc:time}});
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
    if(user.uid !== data.order.store.uid) ctx.throw(400, "您无权修改此订单价格");
    await order.update({$set:{"orderPrice":price}});
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
		if(data.order.store.uid !== user.uid) ctx.throw(400, "您无权查看此订单详情");
		ctx.template = 'shop/manage/detail.pug';
		await next();
  })
  .use("/refund", refundRouter.routes(), refundRouter.allowedMethods());
module.exports = orderRouter;