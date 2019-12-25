const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		let statistics = {};
		let products = await db.ShopGoodsModel.find({uid:user.uid});
		statistics.productCount = products.length;
		const orders = await db.ShopOrdersModel.find({sellUid: user.uid});
		statistics.orderCount = orders.length;
		// 统计数据
		// 统计所有商品的访问量
		const productVisits = await db.ThreadModel.aggregate([
			{$match: {uid: user.uid, type: "product"}},
			{$group: {_id:null, hits:{$sum:"$hits"}}}
		])
		if(productVisits.length > 0) {
			statistics.visitCount = productVisits[0].hits;
		}else{
			statistics.visitCount = 0;
		}
		// 统计所有商品的售卖数量
		const productSellCount = await db.ShopOrdersModel.count({sellUid:user.uid, orderStatus:"finish"});
		statistics.sellCount = productSellCount;
		// 统计商品讨论总量
		let threadIds = [];
		for(var i in products) {
			threadIds.push(products[i].tid)
		}
		const productTalkCount = await db.PostModel.count({pid:{$in:threadIds}});
		statistics.talkCount = productTalkCount;
		// 统计粉丝数量
		statistics.funsCount = await db.SubscribeModel.count({type: "user", tUid: user.uid});
		// 统计商品信息
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
		// 统计订单信息
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
    data.navType = "manage";
		ctx.template = 'shop/manage/home.pug';
		await next();
	})
module.exports = homeRouter;