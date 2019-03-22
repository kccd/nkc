const Router = require('koa-router');
const router = new Router();
router
  .use('/', async(ctx, next) => {
    if(ctx.data.user.uid !== ctx.data.order.uid) ctx.throw(403, '您没有权限操作别人的订单');
    await next();
  })
  .get('/', async(ctx, next) => {
    const {data, db} = ctx;
    const {order} = data;
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    data.order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    if(data.order.refundStatus) {
      data.refund = await db.ShopRefundModel.findOne({buyerId: order.uid, sellerId: data.order.product.uid, orderId: data.order.orderId});
    }
    ctx.template = 'shop/order/refund.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, body, db, tools} = ctx;
    let {order} = data;
    const {refund} = body;
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    const {refundStatus, orderStatus, product, productParam} = order;
    if(refundStatus === 'ing') ctx.throw(400, '订单正在退款中，请勿重复提交退款申请');
    if(refundStatus === 'success') ctx.throw(400, '订单已退款成功，请勿重复提交退款申请');
    if(!refund.reason) ctx.throw(400, '理由不能为空');
    if(tools.checkString.contentLength(refund.reason) > 1000) ctx.throw(400, '理由不能超过1000个字节');
    if(orderStatus === 'unCost') {
      // 未付款 直接取消订单
      const refundDB = await db.ShopRefundModel({
        _id: await db.SettingModel.operateSystemID('shopRefunds', 1),
        status: 'autoCompletion',
        type: 'money',
        buyerId: order.uid,
        sellerId: order.product.uid,
        orderId: order.orderId,
        reason: refund.reason
      });
      await refundDB.save();
      await db.ShopOrdersModel.update({orderId: order.orderId}, {$set: {
        closeToc: Date.now(),
        closeStatus: true,
        refundStatus: 'success'
      }});
    } else if(orderStatus === 'unShip') {
      // 已付款未发货，仅退款
      const refundDB = await db.ShopRefundModel({
        _id: await db.SettingModel.operateSystemID('shopRefunds', 1),
        status: 'applied',
        type: 'money',
        buyerId: order.uid,
        sellerId: order.product.uid,
        orderId: order.orderId,
        reason: refund.reason
      });
      await refundDB.save();
      await db.ShopOrdersModel.update({orderId: order.orderId}, {$set: {
        refundStatus: 'ing'
      }});
    }

    await next();
  });
module.exports = router;