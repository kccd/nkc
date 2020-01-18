const Router = require('koa-router');
const router = new Router();
const singleOrderRouter = require('./singleOrder');
router
  .use('/', async (ctx, next) => {
    const {data, nkcModules} = ctx;
    const {user} = data;
    data.navType = "order";
    if(!user) return ctx.redirect('/login');
    await next();
  })
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {user} = data;
    const {t, page = 0} = query;
    const q = {
      buyUid: user.uid
    };
    if(t === "refunding") {
      q.closeStatus = false;
      q.refundStatus = "ing";
    } else if(t && t !== "all" && t !== "close") {
      q.orderStatus = t;
      q.closeStatus = false;
    } else if(t === "close") {
      q.closeStatus = true;
    }
    const count = await db.ShopOrdersModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    let orders = await db.ShopOrdersModel.find(q).sort({orderToc: -1}).skip(paging.start).limit(paging.perpage);
    orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
    orders = await db.ShopOrdersModel.translateOrderStatus(orders);
    orders = await db.ShopOrdersModel.checkRefundCanBeAll(orders);
    data.orders = orders;
    data.paging = paging;
    data.t = t;
    ctx.template = '/shop/order/order.pug';
    await next();
  })
  /*.get('/', async (ctx, next) => {
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
  })*/
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
  .post("/", async (ctx, next) => {
    const {data, db, body, nkcModules} = ctx;
    const {params} = body;
    if(!params.length) ctx.throw(400, "订单信息错误，请刷新页面");
    const {checkNumber, checkString} = nkcModules.checkData;
    const {location, address, username, mobile} = body.address;
    checkString(location, {
      name: "收货地址地区",
      minLength: 1,
      maxLength: 100
    });
    checkString(address, {
      name: "收货详细地址",
      minLength: 1,
      maxLength: 100
    });
    checkString(username, {
      name: "收件人",
      minLength: 1,
      maxLength: 100
    });
    checkString(mobile, {
      name: "收件人手机号",
      minLength: 1,
      maxLength: 100
    });
    const {user} = data;
    const gradeId = user.grade._id;
    const orderArr = []; 
    // 不同卖家 生成多个订单
    for(const p of params) {
      const {uid, products, buyMessage} = p;
      if(uid === user.uid) ctx.throw(400, "无法购买自己出售的商品");
      const productUser = await db.UserModel.findOne({uid});
      if(!productUser) ctx.throw(404, `卖家ID不正确，uid:${uid}`);
      const orderId = await db.SettingModel.operateSystemID("shopOrders", 1);
      const cartArr = [], costArr = [], certArr = [];
      let orderFreightPrice = 0, orderPrice = 0;
      // 同一买家 生成一个订单
      checkString(buyMessage, {
        name: "买家留言",
        minLength: 0,
        maxLength: 1000
      });
      for(const productObj of products) {
        const {
          productId, productParams,
          certId, freightTotal, priceTotal, freightName
        } = productObj;
        const product = await db.ShopGoodsModel.findOne({productId});
        if(!product) ctx.throw(404, `商品ID错误，productId: ${productId}`);
        if(product.productStatus === "stopsale") {
          ctx.throw(400, `提交的订单中存在停售的商品，请刷新`);
        }
        if(product.uploadCert) {
          if(!certId) ctx.throw(400, "请上传凭证");
          const cert = await db.ShopCertModel.findOne({_id: Number(certId), uid: user.uid, type: "shopping"});
          if(!cert) ctx.throw(400, "凭证ID错误，请重新上传");
          certArr.push(cert);
        }
        let countTotal_ = 0, priceTotal_ = 0;
        // 同一商品不同规格 统一计算邮费
        for(const productParamObj of productParams) {
          const {count, price, _id, cartId} = productParamObj;
          const cart = await db.ShopCartModel.findOne({_id: cartId});
          if(!cart) ctx.throw(404, `购物车数据错误，请刷新`);
          cartArr.push(cart);
          checkNumber(count, {
            name: "商品数量",
            min: 1
          });
          const productParam = await db.ShopProductsParamModel.findOne({_id});
          if(!productParam) ctx.throw(404, `规格ID不正确,paramId: ${_id}`);
          if(!productParam.isEnable) ctx.throw(404, `提交的订单中存在禁售的商品规格，请刷新`);
          if(productParam.stocksSurplus < count) ctx.throw(400, `提交的订单中存在库存不足的商品，请刷新页面`);
          let price_ = productParam.price;
          if(product.vipDiscount) {
            let vipNum = 100;
            product.vipDisGroup.map(v => {
              if((v.vipLevel+"") === (gradeId + "")) {
                vipNum = v.vipNum;
              }
            });
            price_ = parseInt(productParam.price * vipNum / 100);
          }
          if(price_ !== price) ctx.throw(400, `商品价格已更改，请刷新页面`);
          countTotal_ += count;
          priceTotal_ += count * price;
          const costId = await db.SettingModel.operateSystemID('shopCostRecord', 1);
          costArr.push({
            costId,
            orderId,
            productId,
            productParamId: productParam._id,
            productParam,
            uid: user.uid,
            count,
            productPrice: price * count,
            singlePrice: price
          });
        }
        let freightTotal_ = 0;
        if(!product.isFreePost) {
          if(!freightName) ctx.throw(400, `请选择物流`);
          for(const f of product.freightTemplates) {
            if(f.name === freightName) {
              freightTotal_ = f.firstPrice + (countTotal_ - 1) * f.addPrice;
              break;
            }
          }
        }
        if(freightTotal_ !== freightTotal) {
          ctx.throw(400, `运费模板已变更，请刷新页面`);
        }
        orderFreightPrice += freightTotal_;
        orderPrice += priceTotal_;
      }

      orderArr.push({
        orderObj: {
          orderId,
          snapshot: [],
          buyUid: user.uid,
          sellUid: productUser.uid,
          orderFreightPrice,
          orderPrice,
          receiveAddress: `${location} ${address}`,
          receiveName: username,
          receiveMobile: mobile,
          buyMessage
        },
        costArr,
        cartArr,
        certArr
      });
    }

    const ordersId = [];
    for(const obj of orderArr) {
      const {orderObj, cartArr, certArr, costArr} = obj;
      for(const c of costArr) {
        // 生成订单中的已购买商品的记录
        const cost = db.ShopCostRecordModel(c);
        await cost.save();
        orderObj.snapshot.push(cost);
      }
      const order = db.ShopOrdersModel(orderObj);
      await order.save();
      ordersId.push(order.orderId);
      const orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
      await db.ShopProductsParamModel.productParamReduceStock(orders,'orderReduceStock');
      // 删除购物车记录
      for(const c of cartArr) {
        await c.remove();
      }
      for(const cert of certArr) {
        await cert.update({orderId: order.orderId});
      }
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

    data.ordersId = ordersId;
    await next();
  })
  .post('/old', async (ctx, next) => {
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
        let newCartArr = await db.ShopCartModel.extendCartsInfo(cart1, {
          userGradeId: data.user.grade._id
        });
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
        let newCartArr = await db.ShopCartModel.extendCartsInfo(cart1, {
          userGradeId: data.user.grade._id
        });
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