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
    data.ordersId = ordersId;
    data.orders = orders;
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, query, db} = ctx;
    const {user} = data;
    let {ordersId} = query;
    data.ordersInfo = await db.ShopOrdersModel.getOrdersInfo(data.orders);
    data.orders = await db.ShopOrdersModel.storeExtendOrdersInfo(data.orders);
    for(let order of data.orders) {
      for(let a=0;a<order.params.length;a++) {
        let product = order.params[a].product;
        if(product.productStatus == "stopsale") ctx.throw(400, `商品id为(${product.productId})的商品停售，不可购买，请重新下单`)
      }
    }
    data.mainScore = await db.SettingModel.getMainScore();
    await db.UserModel.updateUserScores(user.uid);
    data.userMainScore = await db.UserModel.getUserMainScore(user.uid);
    const rechargeSettings = await db.SettingModel.getSettings('recharge');
    data.rechargeSettings = rechargeSettings.recharge;
    ctx.template = 'shop/pay/pay.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, data, body, tools} = ctx;
    const {password, totalPrice} = body;
    let {user, orders} = data;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    await userPersonal.ensurePassword(password);
    delete body.password;

    let totalMoney = 0;
    // 如果订单价格已被修改，则需要重新发起支付
    for(let order of orders) {
      totalMoney += (order.orderPrice+order.orderFreightPrice);
    }
    await db.UserModel.updateUserScores(user.uid);
    const mainScore = await db.SettingModel.getMainScore();
    const userMainScore = await db.UserModel.getUserScore(user.uid, mainScore.type);
    if(userMainScore < totalMoney) ctx.throw(400, `你的${mainScore.name}不足，请先充值或选择其他付款方式支付`);
    if(totalMoney !== totalPrice) ctx.throw(400, "订单价格已被修改，请重新发起付款或刷新当前页面");
    await db.ShopOrdersModel.createRecordByOrdersId({
      ordersId: orders.map(order => order.orderId),
      totalMoney,
      uid: user.uid
    });
    await next();
  });
module.exports = router;
