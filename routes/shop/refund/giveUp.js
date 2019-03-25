const Router = require('koa-router');
const router = new Router();
router
  // 用户撤销退款/取消订单的申请
  .post('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {refund} = data;
    const {successed, orderId} = refund;
    if(successed) ctx.throw(400, "退款已完成，请勿重复提交");
    if(successed === false) ctx.throw(400, "退款已失败，请勿重复提交");
    const order = await db.ShopOrdersModel.findById(orderId);
    // 更新申请的状态为 B_GU: 卖家撤销申请
    const time = Date.now();
    await refund.update({
      status: "B_GU",
      tlm: time,
      successed: false,
      $addToSet: {
        logs: {
          status: "B_GU",
          time
        }
      }
    });
    // 更新订单的退款状态为 fail: 退款失败
    await order.update({
      refundStatus: "fail"
    });
    await next();
  });
module.exports = router;