const Router = require('koa-router');
const router = new Router();
const singleRefundRouter = require('./singleRefund');
router
  // 提交新的退款申请
  .post('/', async (ctx, next) => {
    const {data, body, db, tools} = ctx;
    const {user} = data;
    const {orderId, refund} = body;
    const {reason, type} = refund;
    // 查询订单判断权限
    let order = await db.ShopOrdersModel.findById(orderId);
    if(order.uid !== user.uid) ctx.throw(403, '您没有权限操作别人的订单');
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    const {refundStatus, orderStatus, product, productParam} = order;
    if(refundStatus === "ing") ctx.throw(400, "订单正在退款中，请勿重复提交退款申请");
    if(refundStatus === "success") ctx.throw(400, "订单已退款成功，请勿重复提交退款申请");
    if(!reason) ctx.throw(400, "理由不能为空");
    if(tools.checkString.contentLength(reason) > 1000) ctx.throw(400, "理由不能超过1000个字节");
    if(!["money", "product", "all", ""].includes(type)) ctx.throw(400, "请选择退款方式(退款、退货、退款+退货)");
    const time = Date.now();
    if(orderStatus === "unCost") {
      // 未付款 直接取消订单
      const refundDB = await db.ShopRefundModel({
        _id: await db.SettingModel.operateSystemID("shopRefunds", 1),
        toc: time,
        status: "CO",
        buyerId: order.uid,
        sellerId: order.product.uid,
        orderId: order.orderId,
        reason,
        logs: [
          {
            type: "CO",
            time,
            info: reason
          }
        ]
      });
      await refundDB.save();
      await db.ShopOrdersModel.update({orderId: order.orderId}, {$set: {
        closeToc: Date.now(),
        closeStatus: true,
        refundStatus: "success"
      }});
    } else if(orderStatus === "unShip") {
      if(type !== "money") ctx.throw(400, "卖家尚未发货，退款方式只能选择【退款】");
      // 已付款未发货，仅退款
      const refundDB = await db.ShopRefundModel({
        _id: await db.SettingModel.operateSystemID("shopRefunds", 1),
        toc: time,
        status: "B_APPLY_RM",
        type: "money",
        buyerId: order.uid,
        sellerId: order.product.uid,
        orderId: order.orderId,
        logs: [
          {
            type: "B_APPLY_RM",
            time,
            info: reason
          }
        ],
        reason
      });
      await refundDB.save();
      await db.ShopOrdersModel.update({orderId: order.orderId}, {$set: {
        refundStatus: "ing"
      }});
    } else {
      if(!["money", "product", "all"].includes(type)) ctx.throw(400, "请选择退款类型（退款、退货、退款+退货）")
      const status = {
        "money": "B_APPLY_RM",
        "product": "B_APPLY_RP",
        "all": "B_APPLY_RALL"
      }[type];
      const refundDB = await db.ShopRefundModel({
        _id: await db.SettingModel.operateSystemID("shopRefunds", 1),
        toc: time,
        status,
        type,
        buyerId: order.uid,
        sellerId: order.product.uid,
        orderId: order.orderId,
        logs: [
          {
            type: status,
            time,
            info: reason
          }
        ],
        reason
      });
      await refundDB.save();
      await db.ShopOrdersModel.update({orderId: order.orderId}, {$set: {
        refundStatus: "ing"
      }});
    }
    await next();
  })
  .use('/:_id', singleRefundRouter.routes(), singleRefundRouter.allowedMethods());
module.exports = router;