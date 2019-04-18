const Router = require('koa-router');
const router = new Router();
const singleOrderRouter = require('./singleOrder');
router
  .use('/', async (ctx, next) => {
    const {data} = ctx;
    const {user} = data;
    if(!user) return ctx.redirect('/login');
    await next();
  })
  /* .use('/', async (ctx, next) => {
    // 处理超过30分钟未付款的订单
    await ctx.db.ShopOrdersModel.clearTimeoutOrders(ctx.data.user.uid);
    await next();
  }) */
  .get('/', async (ctx, next) => {
    const {data, db, query, params, nkcModules} = ctx;
    let {page = 0, orderStatus} = query;
    const {user} = data;
    let q = {
      buyUid: user.uid
    };
    if(orderStatus == "refunding"){
      q.closeStatus = false;
      q.refundStatus = "ing";
    }else if(orderStatus && orderStatus !== 'all' && orderStatus !== 'close') {
      q.orderStatus = orderStatus;
      q.closeStatus = false;
    }else if(orderStatus == "close") {
      q.closeStatus = true;
    }
    const count = await db.ShopOrdersModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    let sort = {orderToc: -1};
    let orders = await db.ShopOrdersModel.find(q).sort(sort).skip(paging.start).limit(paging.perpage);
    data.orders = orders;
    data.orders = await db.ShopOrdersModel.userExtendOrdersInfo(data.orders);
    data.orders = await db.ShopOrdersModel.translateOrderStatus(data.orders);
    data.orders = await db.ShopOrdersModel.checkRefundCanBeAll(data.orders);
		console.log(data.orders)
    data.orderStatus = orderStatus;
    ctx.template = '/shop/order/order.pug';
    await next();
  })
  // 查看订单详情
  .get('/detail', async (ctx, next) => {
    const {data, db, params, query, nkcModules} = ctx;
    const {orderId} = query;
    const {user} = data;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(user.uid !== order.buyUid) ctx.throw(403, "您无权查看此订单");
    if(!order) ctx.throw(400, "订单不存在");
    let orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    data.order = orders[0];
		// 获取订单凭证
		const certs = await db.ShopCertModel.find({orderId});
    data.certs = certs;
    // 获取订单关闭原因
    const refund = await db.ShopRefundModel.findOne({orderId}).sort({_id:-1}).limit(1);
    if(refund) {
      refund.description = ctx.state.lang("shopRefundStatus", refund.status) || refund.status;
    }
    data.refund = refund;
    ctx.template = '/shop/order/detail.pug';
    await next();
  })
  // 提交订单，并跳转到支付
  .post('/', async (ctx, next) => {
    const {data, db, query, body, nkcModules} = ctx;
    const {user} = data;
    let {post, receInfo, paramCert} = body;
    const {receiveAddress, receiveName, receiveMobile} = receInfo;
  

    // 检验凭证
    for(const paramId in paramCert) {
      if(!paramCert.hasOwnProperty(paramId)) continue;
      const certId = paramCert[paramId];
      const param = await db.ShopProductsParamModel.findOnly({_id: paramId});
      const product = await db.ShopGoodsModel.findOnly({productId: param.productId});
      if(!product.uploadCert) continue;
      const cert = await db.ShopCertModel.findOne({_id: Number(certId), uid: user.uid, type: "shopping"});
      if(!cert) ctx.throw(400, "凭证上传错误，请重新上传");
    }

    // 取出全部paid
    let paids = [];
    const ordersId = [];
    for(let bill in post) {
      // 检查库存
      for(let cart of post[bill].carts) {
        if(Number(cart.count) > Number(cart.productParam.stocksSurplus)) ctx.throw(400, `${cart.product.name}+${cart.productParam.name}库存不足`);
      }
      const orderId = await db.SettingModel.operateSystemID('shopOrders', 1);
      let newCarts = [];
      // 添加购买记录
      for(let cart of post[bill].carts) {
        let costId = await db.SettingModel.operateSystemID('shopCostRecord', 1);
        let cartObj = {
          costId,
          orderId,
          productId: cart.productId,
          productParamId: cart.productParamId,
          count: cart.count,
          uid: cart.uid,
          freightPrice: cart.freightPrice,
          productPrice: cart.productPrice,
          singlePrice: cart.productParam.price
        };
        let shopCost = db.ShopCostRecordModel(cartObj)
        await shopCost.save();
        let buyProduct = await db.ShopGoodsModel.findOne({productId:cart.productId});
        let buyRecord = buyProduct.buyRecord;
        if(!buyRecord) buyRecord = {};
        if(buyRecord[user.uid]){
          buyRecord[user.uid].count += cart.count;
        }else{
          buyRecord[user.uid] = {
            count: cart.count
          }
        }
        await buyProduct.update({$set: {buyRecord: buyRecord}});
        // 下单完毕，将商品从购物车中清除
        await db.ShopCartModel.remove({uid: user.uid, productParamId: cart.productParamId});
        newCarts.push(cartObj);
      }
      let order = db.ShopOrdersModel({
        orderFreightPrice: post[bill].maxFreightPrice,
        orderId: orderId,
        receiveAddress: receiveAddress,
        receiveName: receiveName,
        receiveMobile: receiveMobile,
        sellUid: post[bill].user.uid,
        snapshot: newCarts,
        buyMessage: post[bill].message,
        buyUid: user.uid,
        count: bill.productCount,
        orderPrice: post[bill].productPrice
      });
      await order.save();
      // 拓展订单并减库存
      let orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
      await db.ShopProductsParamModel.productParamReduceStock(orders,'orderReduceStock');
      ordersId.push(order.orderId);
    }
    data.ordersId = ordersId.join('-');
    await next();
  })
  .use('/:orderId', singleOrderRouter.routes(), singleOrderRouter.allowedMethods());
module.exports = router;