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
      if(order.uid !== user.uid) ctx.throw(403, `订单【${orderId}】错误`);
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
      totalMoney += order.orderPrice;
    }
    if(totalMoney !== Number(totalPrice)*100) ctx.throw(400, "订单价格已被修改，请重新发起付款或刷新当前页面");

    orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
    //减库存
    await db.ShopProductsParamModel.productParamReduceStock(orders,'payReduceStock');
    for(let order of orders) {
      const r = db.KcbsRecordModel({
        _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
        from: order.uid,
        to: 'bank',
        type: 'pay',
        ordersId: [order.orderId],
        num: order.orderPrice,
        description: `${order.count}x${order.product.name}(${order.productParam.name.join('+')})`,
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
      // 付款完毕，将商品从购物车中清除
      await db.ShopCartModel.remove({uid: user.uid, productParamId: order.productParam._id});
    }
    await db.UserModel.update({uid: user.uid}, {$inc: {kcb: -1*totalMoney}});
    await db.SettingModel.update({_id: 'kcb'}, {$inc: {'c.totalMoney': totalMoney}});
    await next();
  });
module.exports = router;