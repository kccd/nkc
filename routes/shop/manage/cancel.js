const Router = require("koa-router");
const router = new Router();
router
  .use("/", async (ctx, next) => {
    const {body, query, db, data, method} = ctx;
    let orderId;
    if(method === "POST") {
      orderId = body.orderId;
    } else {
      orderId = query.orderId;
    }
    const order = await db.ShopOrdersModel.findById(orderId);
    let orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    orders = await db.ShopOrdersModel.translateOrderStatus(orders);
    const product = await db.ShopGoodsModel.findById(order.productId);
    const products = await db.ShopGoodsModel.extendProductsInfo([product]);
    if(product.uid !== data.user.uid) ctx.throw(400, "您不是订单中商品的卖家，无权取消订单");
    if(order.closeStatus) ctx.throw(400, "订单已被关闭，无需取消订单");
    if(order.refundStatus === "success") ctx.throw(400, "订单已退款成功，无需取消订单");
    if(order.refundStatus === "ing") ctx.throw(400, "买家已申请退款，请先去处理退款申请");
    if(!["unCost", "unShip"].includes(order.orderStatus)) ctx.throw(400, "无法取消已发货的订单");
    data.order = orders[0];
    data.product = products[0];
    await next();
  })
  .get("/", async (ctx, next) => {
    ctx.template = "shop/manage/cancel/cancel.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, body, db, tools} = ctx;
    const {user} = data;
    const {orderId, reason, password} = body;
    let money = body.money * 100;
    money = Number(money.toFixed(2));
    const order = await db.ShopOrdersModel.findById(orderId);
    if(order.orderStatus === "unShip") {
      const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
      const {hashType} = userPersonal;
      const {hash, salt} = userPersonal.password;
      switch(hashType) {
        case 'pw9':
          if(tools.encryption.encryptInMD5WithSalt(password, salt) !== hash) {
            ctx.throw(400, '密码错误, 请重新输入');
          }
          break;
        case 'sha256HMAC':
          if(tools.encryption.encryptInSHA256HMACWithSalt(password, salt) !== hash) {
            ctx.throw(400, '密码错误, 请重新输入');
          }
          break;
        default: ctx.throw(400, '未知的密码加密类型');
      }
    }
    await order.sellerCancelOrder(reason, money);
    await next();
  });
module.exports = router;