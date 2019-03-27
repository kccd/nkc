const Router = require('koa-router');
const router = new Router();
const singleRefundRouter = require('./singleRefund');
router
  .post('/', async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {user} = data;
    const {orderId, refund} = body;
    let {type, reason, root, money} = refund;
    root = !!root;
    // 查询订单 判断权限
    let order = await db.ShopOrdersModel.findById(orderId);
    if(order.uid !== user.uid) ctx.throw(400, "您没有权限操作别人的订单");
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    const {refundStatus, orderStatus} = order;
    // 判断订单退款的状态
    if(refundStatus === "ing") ctx.throw(400, "订单正在退款中，请勿重复提交申请");
    if(refundStatus === "success") ctx.throw(400, "订单退款已完成，请勿重复提交申请");
    // 判断申请是否已存在
    const refunds = await db.ShopRefundModel.find({orderId}).sort({toc: -1});
    if(refunds.length && refunds[0].successed === null) {
      ctx.throw(400, "申请已提交，请勿重复提交申请");
    }
    if(root && !refunds.length) ctx.throw(400, "请先向卖家提出申请，卖家拒绝后可向平台提出申请");
    if(!type) {
      if(orderStatus !== 'unCost') ctx.throw(400, "请选择退款类型（退款、退款+退货）");
    } else {
      if(!["money", "all"].includes(type)) ctx.throw(400, "请选择退款类型（退款、退款+退货）");
    }
    if(!reason) ctx.throw(400, "理由不能为空");
    if(tools.checkString.contentLength(reason) > 1000) ctx.throw(400, "理由不能超过1000个字节");
    const time = Date.now();
    // 未付款时取消订单
    if(orderStatus === 'unCost') {
      const refundDB = await db.ShopRefundModel({
        _id: await db.SettingModel.operateSystemID("shopRefunds", 1),
        toc: time,
        status: "CO",
        buyerId: order.uid,
        sellerId: order.product.uid,
        orderId: order.orderId,
        logs: [
          {
            status: "CO",
            info: reason,
            time
          }
        ]
      });
      await refundDB.save();
      await db.ShopOrdersModel.update({orderId: order.orderId}, {$set: {
        closeToc: Date.now(),
        closeStatus: true,
        refundStatus: "success"
      }});
    } else {
      // 已付款后取消订单
      const r = {
        _id: await db.SettingModel.operateSystemID("shopRefunds", 1),
        toc: time,
        buyerId: order.uid,
        sellerId: order.product.uid,
        orderId: order.orderId,
        root
      };

      if(type !== "product") {
        const refundMoney = Number(money)*100;
        if(refundMoney > 0 && refundMoney <= order.orderPrice){
          r.money = refundMoney;
        }
        else {
          ctx.throw(400, "退款金额必须大于0且不能超过点订单的支付金额");
        } 
      }

      if(orderStatus === "unShip") {
        // 未发货时
        r.status = root? "P_APPLY_RM": "B_APPLY_RM";
        r.type = "money";
      } else {
        // 已发货
        r.type = type;
        if(type === "money") {
          r.status = root? "P_APPLY_RM": "B_APPLY_RM";
        } else {
          r.status = root? "P_APPLY_RALL": "B_APPLY_RALL";
        }
      }
      r.logs = [
        {
          status: r.status,
          info: reason,
          time,
          money: r.money
        }
      ];
      const refundDB = db.ShopRefundModel(r);
      await refundDB.save();
      await db.ShopOrdersModel.update({
        orderId: order.orderId
      }, {
        $set: {
          refundStatus: "ing"
        }
      });
    }
    await next();
  })
  .use('/:_id', singleRefundRouter.routes(), singleRefundRouter.allowedMethods());
module.exports = router;