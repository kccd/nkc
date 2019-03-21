const Router = require('koa-router');
const router = new Router();
router
  .patch('/', async(ctx, next) => {
    const  {data, db, body} = ctx;
    let {order} = data;
    const {reason} = body;
    order = (await db.ShopOrdersModel.userExtendOrdersInfo([order]))[0];
    const {refundStatus, closeStatus, orderStatus} = order;
    if(closeStatus) ctx.throw(400, '订单已被关闭');
    if(refundStatus === 'ing') ctx.throw(400, '订单正在退款中');
    // 未付款，取消订单无需卖家同意。
    if(orderStatus === 'unCost') {
      await db.ShopOrdersModel.update({
        orderId: order.orderId
      }, {
        closeStatus: true
      });
    } else {
      // 若买家已付款，则退款需要卖家同意，若卖家已发货则还需退货。
      const refund = db.ShopRefundModel({
        _id: await db.SettingModel.operateSystemID('shopRefunds', 1),
        buyerId: order.uid,
        sellerId: order.product.uid,
        productParamId: order.paramId,
        orderId: order.orderId,
        productId: order.productId,
        refundProduct: ['unSign', 'finish'].includes(orderStatus),
        reason
      });
      await refund.save();
      await db.ShopOrdersModel.update({
        orderId: order.orderId
      }, {
        refundStatus: 'ing'
      });
    }
    await next();
  });
module.exports = router;