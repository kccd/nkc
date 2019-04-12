const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const storeId = params.account;
		let statistics = {};
		let products = await db.ShopGoodsModel.find({storeId:storeId});
		statistics.productCount = products.length;
		const orders = await db.ShopOrdersModel.find({storeId: storeId});
		statistics.orderCount = orders.length;
		// 统计数据
		// 统计所有商品的访问量
		const productVisits = await db.ThreadModel.aggregate([
			{$match: {uid: user.uid}},
			{$group: {_id:null, hits:{$sum:"$hits"}}}
		])
		statistics.visitCount = productVisits[0].hits;
		// 统计所有商品的售卖数量
		const productSellCount = await db.ShopOrdersModel.count({storeId:storeId, orderStatus:"finish"});
		statistics.sellCount = productSellCount;
		// 统计商品讨论总量
		let threadIds = [];
		for(var i in products) {
			threadIds.push(products[i].tid)
		}
		const productTalkCount = await db.PostModel.count({pid:{$in:threadIds}});
		statistics.talkCount = productTalkCount;
		// 统计粉丝数量
		const userSubscribe = await db.UsersSubscribeModel.findOne({uid:user.uid});
		statistics.funsCount = userSubscribe.subscribers.length;
		// 统计订单信息
		let productInsaleCount = 0;
		let productNosaleCount = 0;
		let productStopsaleCount = 0;
		for(let p of products) {
			if(p.productStatus == "insale") productInsaleCount += 1;
			if(p.productStatus == "notonshelf") productNosaleCount += 1;
			if(p.productStatus == "stopsale") productStopsaleCount += 1;
		}
		statistics.productInsaleCount = productInsaleCount;
		statistics.productNosaleCount = productNosaleCount;
		statistics.productStopsaleCount = productStopsaleCount;
		// 统计商品信息
		let orderUnCostCount = 0;
		let orderUnShipCount = 0;
		let orderUnSignCount = 0;
		let orderFinishCount = 0;
		let orderRefundCount = 0;
		for(let o of orders) {
			if(o.orderStatus == "unCost") orderUnCostCount += 1;
			if(o.orderStatus == "unShip") orderUnShipCount += 1;
			if(o.orderStatus == "unSign") orderUnSignCount += 1;
			if(o.orderStatus == "finish") orderFinishCount += 1;
			if(o.refundStatus == "ing") orderRefundCount += 1;
		}
		statistics.orderUnCostCount = orderUnCostCount;
		statistics.orderUnShipCount = orderUnShipCount;
		statistics.orderUnSignCount = orderUnSignCount;
		statistics.orderFinishCount = orderFinishCount;
		statistics.orderRefundCount = orderRefundCount;
		data.statistics = statistics;
		ctx.template = 'shop/manage/home.pug';
		await next();
	})
module.exports = homeRouter;