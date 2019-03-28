const Router = require('koa-router');
const applysRouter = new Router();
applysRouter
	.get('/', async (ctx, next) => {
    const {data, db} = ctx;
		// 取出待处理的退款申请
		const refunds = await db.ShopRefundModel.find({root: true, successed:null}).sort({toc:-1});
		data.refunds = refunds;
		ctx.template = "experimental/shop/refund/refunds.pug"
		await next();
	})
	// 平台同意退款申请
	.post('/agree', async (ctx, next) => {
		const {tools, data, db, body} = ctx;
		const {orderId, reason} = body;
		const refund = await db.ShopRefundModel.findOne({orderId}).sort({toc: -1});
		if(!refund) ctx.throw(404, `订单【${orderId}】不存在退款申请`);
		if(refund.successed !== null) ctx.throw(400, "申请已关闭");
		const {status} = refund;
		const time = Date.now();
		if(!["P_APPLY_RM", "P_APPLY_RP"].includes(status)) {
			ctx.throw(400, "申请状态已改变，请刷新");
		}
		if(reason && tools.checkString.contentLength(reason) > 1000) ctx.throw(400, "理由不能超过1000个字节");
		await refund.pingtaiAgreeRMP(reason);
		await next();
	})
	.post('/disagree', async (ctx, next) => {
		const {tools, data, db, body} = ctx;
		const {orderId, reason} = body;
		const refund = await db.ShopRefundModel.findOne({orderId}).sort({toc: -1});
		if(!refund) ctx.throw(404, `订单【${orderId}】不存在退款申请`);
		if(refund.successed !== null) ctx.throw(400, "申请已关闭");
		const {status} = refund;
		const time = Date.now();
		if(!["P_APPLY_RM", "P_APPLY_RP"].includes(status)) {
			ctx.throw(400, "申请状态已改变，请刷新");
		}
		if(!reason) ctx.throw(400, "拒绝的理由不能为空");
		if(reason && tools.checkString.contentLength(reason) > 1000) ctx.throw(400, "理由不能超过1000个字节");
		await refund.pingtaiDisagreeRMP(reason);
		// const newStatus = status.replace("P_APPLY", "P_DISAGREE");
		// await db.ShopRefundModel.update({_id:refund._id}, {
		// 	$set: {
		// 		tlm: time,
		// 		status: newStatus,
		// 		successed: false
		// 	},
		// 	$addToSet: {
		// 		logs: {
		// 			status: newStatus,
		// 			time,
		// 			info: reason
		// 		}
		// 	}
		// })
		// await db.ShopOrdersModel.update({orderId: orderId}, {
		// 	$set: {
		// 		refundStatus: "fail"
		// 	}
		// });
		await next();
	})
	.get('/refundDetail', async(ctx, next) => {
		const {data, db, body, query} = ctx;
		const {orderId} = query;
		let order = await db.ShopOrdersModel.findById(orderId);
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    // 获取该订单的全部退款申请记录
    const refunds = await db.ShopRefundModel.find({
      orderId: order.orderId,
      sellerId: order.product.uid,
      buyerId: order.uid
    }).sort({toc: 1});
    if(refunds.length !== 0) {
      if(refunds[refunds.length - 1].successed === null) data.refund = refunds[refunds.length - 1];
    }
		await db.ShopRefundModel.extendLogs(refunds, ctx.state.lang);
		data.order = order;
		data.refunds = refunds;
		ctx.template = "experimental/shop/refund/refundDetail.pug"
		await next();
	})
module.exports = applysRouter;