const Router = require('koa-router');
const applysRouter = new Router();
applysRouter
	.get('/', async (ctx, next) => {
    const {nkcModules, query, data, db} = ctx;
    const {page=0, t} = query;
    const q = {
      root: true
    };
    if(t === "applying") {
      q.successed = null;
    } else if(t === "done") {
      q.successed = {$ne: null}
    }
    data.t = t;
    const count = await db.ShopRefundModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const refunds = await db.ShopRefundModel.find(q).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    data.refunds = [];
    const orderId = [];
    for(const r of refunds) {
      if(!orderId.includes(r.orderId)) {
        orderId.push(r.orderId);
      } else {
        continue;
      }
      const refund = r.toObject();
      refund.buyer = await db.UserModel.findOnly({uid: refund.buyerId});
      refund.seller = await db.UserModel.findOnly({uid: refund.sellerId});
      data.refunds.push(refund);
    }

    ctx.template = "experimental/shop/refund/refunds.pug"
    
		await next();
  })
  .use(["/agree", "/disagree"], async (ctx, next) => {
    const {data, db, body} = ctx;
		const {orderId} = body;
		const refund = await db.ShopRefundModel.findOne({orderId}).sort({toc: -1});
		if(!refund) ctx.throw(404, `订单【${orderId}】未处于退款流程`);
    if(refund.successed !== null) ctx.throw(400, "申请已关闭， 请刷新");
    data.refund = refund;
    await next();
  })
	// 平台同意退款申请
	.post('/agree', async (ctx, next) => {
    const {data} = ctx;
    const {refund} = data;
    await refund.platformAgreeRM();
		await next();
	})
	.post('/disagree', async (ctx, next) => {
		const {data, body} = ctx;
    const {refund} = data;
    await refund.platformAgreeRM(body.reason);
		await next();
	})
	.get('/refundDetail', async(ctx, next) => {
		const {data, db, body, query} = ctx;
		const {orderId} = query;
    let order = await db.ShopOrdersModel.findById(orderId);
    await order.extendCerts();
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