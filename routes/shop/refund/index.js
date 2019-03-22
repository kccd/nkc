const Router = require('koa-router');
const router = new Router();
const singleRefundRouter = require('./singleRefund');
router
  .post('/', async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {refund, orderId} = body;
    const {user} = data;
    let order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, `不存在ID为【${orderId}】的订单`);
    if(order.uid !== user.uid) ctx.throw(403, '您没有权限操作别人的订单');
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
        status: 'CO',
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
        status: 'B_APPLY',
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
  })
  .use('/:_id', singleRefundRouter.routes(), singleRefundRouter.allowedMethods());
module.exports = router;