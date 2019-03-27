const Router = require("koa-router");
const router = new Router();
router
  .use("/", async (ctx, next) => {
    const {query, method, data, db, body} = ctx;
    const {user} = data;
    let orderId;
    if(["GET", "DELETE"].includes(method)) {
      orderId = query.orderId;
    } else {
      orderId = body.orderId;
    }
    let order = await db.ShopOrdersModel.findById(orderId);
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    if(order.product.uid !== user.uid) ctx.throw(400, "权限不足，您不是订单中商品的卖家");
    data.order = order;
    await next();
  })
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {order} = data;
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
  })
  .post("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {order} = data;
    const {type, reason} = body;
    const refund = await db.ShopRefundModel.findOne({
      orderId: order.orderId
    }).sort({toc: -1});
    if(!refund) ctx.throw(404, `订单【${order.orderId}】不存在退款申请`);

    if(type === "agreeRM") {
      // 卖家同意退款
      await refund.sellerAgreeRM(reason);
    } else if(type === "disagreeRM") {
      // 卖家拒绝退款
      await refund.sellerDisagreeRM(reason);
    } else if(type === "agreeRP") {
      // 卖家同意退货
      await refund.sellerAgreeRP(reason);
    } else if(type === "disagreeRP") {
      // 卖家拒绝退货
      await refund.sellerDisagreeRP(reason);
    } else {
      ctx.throw(400, `未知的操作类型 type=${type}`);
    }
    await next();
  });
module.exports = router;