const Router = require('koa-router');
const router = new Router();
const singleRefundRouter = require('./singleRefund');
router
  .post('/', async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {user} = data;
    const {orderId, refund} = body;
    let {type, reason, root, money, paramId} = refund;
    root = !!root;
    // 查询订单 判断权限
    let order = await db.ShopOrdersModel.findById(orderId);
    let param;
    const orderDB = order;
    if(order.buyUid !== user.uid) ctx.throw(400, "您没有权限操作别人的订单");
    const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    order = (await db.ShopOrdersModel.translateOrderStatus(orders))[0];
    const {refundStatus, orderStatus} = order;
    // 判断订单退款的状态
    if(refundStatus === "ing") ctx.throw(400, "订单正在退款中，请勿重复提交申请");
    if(refundStatus === "success") ctx.throw(400, "订单退款已完成，请勿重复提交申请");
    // 判断申请是否已存在
    const refunds = await db.ShopRefundModel.find({orderId}).sort({toc: -1});
    if(refunds.length && refunds[0].succeed === null) {
      ctx.throw(400, "申请已提交，请勿重复提交申请");
    }
    // 判断是否为订单中的最后一个商品，若是则改为退全部
    let count = 0;
    for(const p of order.params) {
      if(p.refundStatus === "") {
        count++;
      }
      if(p.costId === paramId) {
        if(p.refundStatus !== "")  ctx.throw(400, "商品已退款，请刷新");
        param = p;
      }
    }
    if(count <= 1) {
      param = "";
    }

    if(root && !refunds.length) ctx.throw(400, "请先向卖家提出申请，卖家拒绝后可向平台提出申请");
    if(!type) {
      if(orderStatus !== 'unCost') ctx.throw(400, "请选择退款类型（退款、退款+退货）");
    } else {
      if(!["money", "product"].includes(type)) ctx.throw(400, "请选择退款类型（退款、退款+退货）");
    }
    if(!reason) ctx.throw(400, "理由不能为空");
    if(tools.checkString.contentLength(reason) > 1000) ctx.throw(400, "理由不能超过1000个字节");
    const time = Date.now();
    // 未付款时取消订单
    if(orderStatus === 'unCost') {
      await orderDB.cancelOrder(reason);
    } else {
      // 已付款后取消订单
      const r = {
        _id: await db.SettingModel.operateSystemID("shopRefunds", 1),
        toc: time,
        buyerId: order.buyUid,
        sellerId: order.sellUid,
        orderId: order.orderId,
        paramId: param?param.costId: "",
        root
      };
      let refundMoney = Number(money)*100;
      refundMoney = Number(refundMoney.toFixed(2));
      if(refundMoney < 0) ctx.throw(400, "退款金额不能小于0");
      if(param) {
        if(refundMoney > param.productPrice) ctx.throw(400, "退款金额不能超过要退款的商品的金额");
      } else {
        if(refundMoney > order.orderPrice) ctx.throw(400, "退款金额不能超过全部商品的总金额");
      }
      r.money = refundMoney;
      if(orderStatus === "unShip") {
        // 未发货时
        r.status = root? "B_INPUT_CERT_RM": "B_APPLY_RM";
        r.type = "money";
      } else {
        // 已发货
        r.type = type;
        if(type === "money") {
          r.status = root? "B_INPUT_CERT_RM": "B_APPLY_RM";
        } else {
          if(root) ctx.throw(400, "请求平台介入时退款方式只能选择【只退款】");
          r.status = "B_APPLY_RP";
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
      if(root) {
        await db.ShopCertModel.updateMany({
          orderId,
          uid: user.uid,
          deletable: true,
          type: "refund",
          paramId: param? param.costId: ''
        }, {
          $set: {
            deletable: false
          }
        });
      }
      const refundDB = db.ShopRefundModel(r);
      await refundDB.save();
      if(!root) {
        // 向卖家发送消息
        await db.MessageModel.sendShopMessage({
          type: "shopBuyerApplyRefund",
          r: order.sellUid,
          orderId: order.orderId,
          refundId: refundDB._id
        });
      } else {
        await db.MessageModel.sendShopMessage({
          type: "shopSellerRefundChange",
          r: order.sellUid,
          orderId: order.orderId,
          refundId: refundDB._id
        });
      }
      if(param) {
        await db.ShopCostRecordModel.update({costId: param.costId}, {
          $set: {
            refundStatus: "ing"
          }
        });
      } else {
        await db.ShopCostRecordModel.updateMany({orderId: order.orderId, refundStatus: ""}, {
          $set: {
            refundStatus: "ing"
          }
        });
      }
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