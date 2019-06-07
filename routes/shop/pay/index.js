const Router = require('koa-router');
const router = new Router();
router
  .use('/', async (ctx, next) => {
    const {data, method, query, body, db} = ctx;
    let ordersId = '';
    const {user} = data;
    if(method === 'POST') {
      ordersId = body.ordersId;
    } else {
      ordersId = query.ordersId;
    }
    ordersId = ordersId.split('-');
    const orders = [];
    for(const orderId of ordersId) {
      const order = await db.ShopOrdersModel.findOne({orderId});
      if(!order) ctx.throw(400, `未找到ID为【${orderId}】的订单`);
      if(order.buyUid !== user.uid) ctx.throw(403, `订单【${orderId}】错误`);
      if(order.closeStatus) ctx.throw(400, "订单已关闭");
      if(order.orderStatus !== 'unCost') ctx.throw(400, `订单【${orderId}】暂不需要付款，请勿重复提交`);
      orders.push(order);
    }
    data.orders = orders;
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, query, db} = ctx;
    let {ordersId} = query;
    data.ordersId = ordersId;
    data.ordersInfo = await db.ShopOrdersModel.getOrdersInfo(data.orders);
    data.orders = await db.ShopOrdersModel.storeExtendOrdersInfo(data.orders);
    for(let order of data.orders) {
      for(let a=0;a<order.params.length;a++) {
        let product = order.params[a].product;
        if(product.productStatus == "stopsale") ctx.throw(400, `商品id为(${product.productId})的商品停售，不可购买，请重新下单`)
      }
    }
    ctx.template = 'shop/pay/pay.pug';
    await next();
  })
  .get('/alipay', async (ctx, next) => {
    const {data, db} = ctx;
    const {user, orders} = data;
    const ordersInfo = await db.ShopOrdersModel.getOrdersInfo(orders);
    data.alipayUrl = await db.KcbsRecordModel.getAlipayUrl({
      uid: user.uid,
      money: ordersInfo.totalMoney,
      ip: ctx.address,
      port: ctx.port,
      title: ordersInfo.title,
      notes: ordersInfo.description,
      backParams: {
        type: 'pay',
        ordersId: ordersInfo.ordersId
      }
    });
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, data, body, tools} = ctx;
    const {password, totalPrice} = body;
    let {user, orders} = data;
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
    let totalMoney = 0;
    // 如果订单价格已被修改，则需要重新发起支付
    for(let order of orders) {
      totalMoney += (order.orderPrice+order.orderFreightPrice);
    }
    user.kcb = await db.UserModel.updateUserKcb(user.uid);
    if(user.kcb < totalMoney) ctx.throw(400, "您的科创币不足，请先充值或选择其他付款方式支付");
    if(totalMoney !== Number(totalPrice)*100) ctx.throw(400, "订单价格已被修改，请重新发起付款或刷新当前页面");

    for(let order of orders) {
      const r = db.KcbsRecordModel({
        _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
        from: order.buyUid,
        to: 'bank',
        type: 'pay',
        ordersId: [order.orderId],
        num: totalMoney,
        ip: ctx.address,
        port: ctx.port,
        verify: true
      });
      await r.save();
      // 更改订单状态为已付款，添加付款时间。
      await db.ShopOrdersModel.update({orderId: order.orderId}, {$set: {
        orderStatus: 'unShip',
        payToc: r.toc
      }});
      // 给卖家发送付款成功消息
      await db.MessageModel.sendShopMessage({
        type: "shopBuyerPay",
        r: order.sellUid,
        orderId: order.orderId
      });
    }
    // 拓展订单 并 付款减库存
    orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
    await db.ShopProductsParamModel.productParamReduceStock(orders,'payReduceStock');
    user.uid = await db.UserModel.updateUserKcb(user.uid);
    await next();
  });
module.exports = router;