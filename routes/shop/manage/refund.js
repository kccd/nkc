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
    const {tools, data, db, body} = ctx;
    const {order} = data;
    const {type, reason} = body;
    const refund = await db.ShopRefundModel.findOne({
      orderId: order.orderId
    }).sort({toc: -1});
    if(!refund) ctx.throw(404, `订单【${order.orderId}】不存在退款申请`);
    if(refund.successed !== null) ctx.throw(400, "申请已关闭");
    const {status} = refund;
    const time = Date.now();
    if(["agreeR", "disagreeR"].includes(type)) {
      if(!["B_APPLY_RM", "B_APPLY_RP", "B_APPLY_RALL"].includes(status)) {
        ctx.throw(400, "申请状态已改变，请刷新");
      }
      if(type === "agreeR") {
        // 同意
        if(reason && tools.checkString.contentLength(reason) > 1000) ctx.throw(400, "拒绝理由不能超过1000个字节");
        const newStatus = status.replace("B_APPLY", "S_AGREE");
        await db.ShopRefundModel.update({_id: refund._id}, {
          $set: {
            tlm: time,
            status: newStatus
          },
          $addToSet: {
            logs: {
              status: newStatus,
              time,
              info: reason
            }
          }
        });
        if(refund.type === 'money') {
          console.log('退款开始');
          await refund.returnMoney();
          console.log('退款结束');
        }
      } else {
        // 拒绝
        if(!reason) ctx.throw(400, "拒绝的理由不能为空");
        if(tools.checkString.contentLength(reason) > 1000) ctx.throw(400, "拒绝理由不能超过1000个字节");
        const newStatus = status.replace("B_APPLY", "S_DISAGREE");
        await db.ShopRefundModel.update({_id: refund._id}, {
          $set: {
            tlm: time,
            status: newStatus,
            successed: false
          },
          $addToSet: {
            logs: {
              status: newStatus,
              time,
              info: reason
            }
          }
        });
        await db.ShopOrdersModel.update({orderId: order.orderId}, {
          $set: {
            refundStatus: "fail"
          }
        });
      }
    }
    await next();
  });
module.exports = router;