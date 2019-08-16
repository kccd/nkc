const Router = require('koa-router');
const router = new Router();
const singleOrderRouter = require('./singleOrder');
router
  .use('/', async (ctx, next) => {
    const {data, nkcModules} = ctx;
    const {user} = data;
    if(!user) return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, '/login'));
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
    let {post, receInfo, paramCert, tempArr} = body;
    const {receiveAddress, receiveName, receiveMobile} = receInfo;
  

    // 检验凭证
    for(const paramId in paramCert) {
      if(!paramCert.hasOwnProperty(paramId)) continue;
      const certId = paramCert[paramId];
      const param = await db.ShopProductsParamModel.findOnly({_id: paramId});
      const product = await db.ShopGoodsModel.findOnly({productId: param.productId});
      if(product.productStatus == "stopsale") ctx.throw(400, `商品id为(${product.productId})的商品停售，不可购买，请重新下单`);
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
        let cart1 = await db.ShopCartModel.find({_id:cart._id});
        if(!cart1 || cart1.length === 0) ctx.throw(400, `您已下单，请前往我的订单进行支付`);
        let newCartArr = await db.ShopCartModel.extendCartsInfo(cart1);
        let newCart = newCartArr[0];
        if(Number(newCart.count) > Number(newCart.productParam.stocksSurplus)) ctx.throw(400, `${newCart.product.name}+${newCart.productParam.name}库存不足`);
      }
      const orderId = await db.SettingModel.operateSystemID('shopOrders', 1);
      let newCarts = [];
      let maxFreightPrice = 0;
      let productPrice = 0;
      let currentFreight = 0;
      // 添加购买记录
      for(let cart of post[bill].carts) {
        let cart1 = await db.ShopCartModel.find({_id:cart._id});
        let newCartArr = await db.ShopCartModel.extendCartsInfo(cart1);
        let newCart = newCartArr[0];
        let costId = await db.SettingModel.operateSystemID('shopCostRecord', 1);
        let newProductParam = await db.ShopProductsParamModel.findOne({_id:newCart.productParamId});
        if(!newProductParam) ctx.throw(400, "商品规格已被商家修改，请重新下单")
        // 取出会员折扣
        let vipNum = 100;
        if(newCart.product.vipDiscount) {
          for(let v=0;v<newCart.product.vipDisGroup.length;v++) {
            if(data.user && data.user.authLevel == newCart.product.vipDisGroup[v].vipLevel) {
              vipNum = newCart.product.vipDisGroup[v].vipNum;
            }
          }
          newCart.vipDiscount = true;
        }else{
          newCart.vipDiscount = true;
        }
        newCart.vipNum = vipNum
        // 获取邮费
        for(var i in tempArr) {
          if(Number(tempArr[i].cartId) === cart._id) {
            currentFreight = tempArr[i].freight
          }
        }
        let cartObj = {
          costId,
          orderId,
          productId: newCart.productId,
          productParamId: newCart.productParamId,
          productParam: newProductParam,
          count: newCart.count,
          uid: newCart.uid,
          freightPrice: currentFreight,
          productPrice: (newCart.productParam.price * (vipNum/100))*newCart.count,
          singlePrice: newCart.productParam.price * (vipNum/100)
        };
        let shopCost = db.ShopCostRecordModel(cartObj);
        if(paramCert[newCart.productParamId]) {
          await db.ShopCertModel.update({_id: paramCert[newCart.productParamId]}, {
            $set: {
              orderId,
              paramId: costId || ""
            }
          })
        }
        await shopCost.save();
        let buyProduct = await db.ShopGoodsModel.findOne({productId:newCart.productId});
        let buyRecord = buyProduct.buyRecord;
        if(!buyRecord) buyRecord = {};
        if(buyRecord[user.uid]){
          buyRecord[user.uid].count += newCart.count;
        }else{
          buyRecord[user.uid] = {
            count: newCart.count
          }
        }
        await buyProduct.update({$set: {buyRecord: buyRecord}});
        // 下单完毕，将商品从购物车中清除
        await db.ShopCartModel.remove({uid: user.uid, productParamId: newCart.productParamId});
        newCarts.push(cartObj);
        productPrice += cartObj.singlePrice * cartObj.count;
        let newMaxFreightPrice = newCart.product.freightPrice.firstFreightPrice + (newCart.product.freightPrice.addFreightPrice * (newCart.count-1))
        if(newMaxFreightPrice > maxFreightPrice) {
          maxFreightPrice = newMaxFreightPrice;
        }
      }
      // 重新计算运费和商品价格

      // 获取账单的运费和商品价格
      let order = db.ShopOrdersModel({
        orderFreightPrice: currentFreight,
        orderId: orderId,
        receiveAddress: receiveAddress,
        receiveName: receiveName,
        receiveMobile: receiveMobile,
        sellUid: post[bill].user.uid,
        snapshot: newCarts,
        buyMessage: post[bill].message,
        buyUid: user.uid,
        count: bill.productCount,
        orderPrice: productPrice
      });
      await order.save();
      // 拓展订单并减库存
      let orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
      await db.ShopProductsParamModel.productParamReduceStock(orders,'orderReduceStock');
      ordersId.push(order.orderId);

      // 通知卖家有新的订单
      const message = db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        r: order.sellUid,
        ty: "STU",
        c: {
          type: "shopSellerNewOrder",
          orderId: order.orderId,
          sellerId: order.sellUid,
          buyerId: order.buyUid
        }
      });
      await message.save();
      await ctx.redis.pubMessage(message);

    }
    data.ordersId = ordersId.join('-');
    await next();
  })
  .use('/:orderId', singleOrderRouter.routes(), singleOrderRouter.allowedMethods());
module.exports = router;