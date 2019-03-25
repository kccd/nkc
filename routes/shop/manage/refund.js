const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {query, db, data} = ctx;
    const {user} = data;
    const {orderId} = query;
    let order = await db.ShopOrdersModel.findById(orderId);
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    order = order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    if(order.product.uid !== user.uid) ctx.throw(400, "权限不足，您不是订单中商品的卖家");
    data.order = order;
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
    data.refunds = refunds;
    ctx.template = "shop/manage/refund/refund.pug";
    await next();
  });
module.exports = router;