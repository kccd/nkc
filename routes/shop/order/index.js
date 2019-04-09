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
      uid: user.uid
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
    const orders = await db.ShopOrdersModel.find(q).sort(sort).skip(paging.start).limit(paging.perpage);
    data.orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
    data.orders = await db.ShopOrdersModel.translateOrderStatus(data.orders);
    data.orderStatus = orderStatus;
    ctx.template = '/shop/order/order.pug';
    await next();
  })
  /* .get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {page = 0} = query;
		let {orderStatus} = query;
		const {user} = data;
		let storeId = params.account;
		// 构造查询条件
		let searchMap = {
			// storeId : "7", 
      uid: user.uid,
      closeStatus: false
		}
		if(orderStatus && orderStatus !== "all"){
			searchMap.orderStatus = orderStatus;
		}
    const count = await db.ShopOrdersModel.count(searchMap);
		const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    const sort = {};
    if(orderStatus !== 'unCost') {
      sort.payToc = -1;
    } else {
      sort.orderToc = -1;
    }
		const orders = await db.ShopOrdersModel.find(searchMap).sort(sort).skip(paging.start).limit(paging.perpage);
    data.orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
    data.orderStatus = orderStatus;
    ctx.template = '/shop/order/order.pug';
    await next();
  })
  */
  // 查看订单详情
  .get('/detail', async (ctx, next) => {
    const {data, db, params, query, nkcModules} = ctx;
    const {orderId} = query;
    const {user} = data;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(user.uid !== order.uid) ctx.throw(403, "您无权查看此订单");
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
    const {post, receInfo, paramCert} = body;
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
    for(let bill of post) {
      // 获取对应规格商品
      let productParams = await db.ShopProductsParamModel.find({_id: bill.paraId});
      productParams = await db.ShopProductsParamModel.extendParamsInfo(productParams);
      let productParam = productParams[0];
      // 检查库存
      let stockCostMethod = productParam.product.stockCostMethod;
      let stocksSurplus = productParam.stocksSurplus;
      if(Number(bill.productCount) > Number(stocksSurplus)) ctx.throw(400, "库存不足");
      const orderId = await db.SettingModel.operateSystemID('shopOrders', 1);
      // 计算邮费
      let freightPrice = await nkcModules.apiFunction.calculateFreightPrice(productParam.product.freightPrice, bill.productCount, productParam.product.isFreePost)
      const order = db.ShopOrdersModel({
        orderId: orderId,
        receiveAddress: receiveAddress,
        receiveName: receiveName,
        receiveMobile: receiveMobile,
        storeId: productParam.product.storeId,
        productId: productParam.productId,
        paramId: productParam._id,
        uid: user.uid,
        count: bill.productCount,
        orderOriginPrice: (productParam.price) * bill.productCount + freightPrice,
        orderPrice: (productParam.price) * bill.productCount + freightPrice
      });
      await order.save();
      //减库存
      await db.ShopProductsParamModel.productParamReduceStock([order],'orderReduceStock');
      await db.ShopCertModel.update({_id: paramCert[productParam._id]}, {$set: {
        orderId: orderId,
        deletable: false
      }});
      ordersId.push(order.orderId);
    }
    data.ordersId = ordersId.join('-');
    await next();
  })
  .use('/:orderId', singleOrderRouter.routes(), singleOrderRouter.allowedMethods());
module.exports = router;