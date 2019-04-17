const Router = require("koa-router");
const router = new Router();
router
  .use('/', async(ctx, next) => {
    const {data, query} = ctx;
    const {id} = query;
    const {user, order} = data;
    if(user.uid !== order.buyUid) ctx.throw(403, "您没有权限操作别人的订单");
    if(id) {
      data.param = await order.getParamById(id);
    }
    await next();
  })
  .get('/', async(ctx, next) => {
    const {data, db} = ctx;
    let {order, param} = data;
    await order.extendCerts("buyer", param?param._id:"");
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    data.order = order;
    // 获取该订单的全部退款申请记录
    const refunds = await db.ShopRefundModel.find({
      orderId: order.orderId,
      sellerId: order.sellUid,
      buyerId: order.buyUid
    }).sort({toc: 1});
    if(refunds.length !== 0) {
      if(refunds[refunds.length - 1].succeed === null) data.refund = refunds[refunds.length - 1];
    }
    await db.ShopRefundModel.extendLogs(refunds, ctx.state.lang);
    data.refunds = refunds;
    ctx.template = "shop/order/refund.pug";
    await next();
  });
module.exports = router;