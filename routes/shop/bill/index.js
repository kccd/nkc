const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    let {cartsId, paraId, productCount, freightId} = query;
    let billType;
    paraId = Number(paraId);
    if(!cartsId){
      billType = "product";
      if(!productCount) ctx.throw(400, "请选择商品数量");
      if(!paraId) ctx.throw(400, "请选择商品");
      const billProducts = await db.ShopProductsParamModel.findOne({_id: paraId});
      const newCart = db.ShopCartModel({
        _id: await db.SettingModel.operateSystemID('shopCarts', 1),
        productParamId: paraId,
        productId: billProducts.productId,
        count: productCount,
        freightId: freightId,
        uid: user.uid
      })
      await newCart.save();
      const cartsData = [newCart];
      data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData);
      // const billProducts = await db.ShopProductsParamModel.findOne({_id: paraId});
      // const product = await db.ShopGoodsModel.findOne({productId: billProducts[0].productId});
      // if(product.productStatus == "stopsale") ctx.throw(400, "商品停售中，不可购买")
      // data.cartsData = await db.ShopProductsParamModel.extendParamsInfo(billProducts);
      // data.cartsData[0].count = Number(productCount);
      // data.cartsData[0].productParamId = Number(paraId);
      // data.cartsData[0].productParam = await db.ShopProductsParamModel.extendParamsInfo(billProducts[0]);
      // data.cartsData  = billProducts;
    }else{
      billType = "cart";
      cartsId = cartsId.split('-');
      const cartsData = await db.ShopCartModel.find({_id: {$in: cartsId}}); 
      data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData);
    }
    data.billType = billType;

    // 将账单按卖家进行分类
    let newCartData = {}; 
    for(const cart of data.cartsData) {
      const newCartDataUid = cart.product.uid;
      // 计算单个商品运费
      let freightPrice;
      if(cart.product.isFreePost){
        freightPrice = 0;
      }else{
        let ffp, afp;
        for(var i in cart.product.freightTemplates) {
          if(Number(i) === cart.freightId) {
            ffp = cart.product.freightTemplates[Number(i)].firstPrice;
            afp = cart.product.freightTemplates[Number(i)].addPrice;
          }
        }
        if(!ffp && ffp !== 0) ffp = cart.product.freightTemplates[0].firstPrice;
        if(!afp && afp !== 0) afp = cart.product.freightTemplates[0].addPrice;
        freightPrice = ffp + (afp * (cart.count-1));
      }
      cart.freightPrice = freightPrice;
      // 取出会员折扣
      let vipNum = 100;
			if(cart.product.vipDiscount) {
				for(let v=0;v<cart.product.vipDisGroup.length;v++) {
					if(data.user && data.user.authLevel == cart.product.vipDisGroup[v].vipLevel) {
						vipNum = cart.product.vipDisGroup[v].vipNum;
					}
        }
        cart.vipDiscount = true;
      }else{
        cart.vipDiscount = true;
      }
      cart.vipNum = vipNum
      // 计算商品价格合计(含运费)
      let productPrice = cart.count * (cart.productParam.price * (vipNum / 100))
      cart.productPrice = productPrice;
      if(!newCartData[newCartDataUid]) {
        newCartData[newCartDataUid] = {
          user: cart.product.user,
          carts: [cart],
          maxFreightPrice: freightPrice,
          totalLittleFreight: freightPrice,
          productPrice: productPrice
        }
      } else {
        newCartData[newCartDataUid].carts.push(cart);
        if(freightPrice > newCartData[newCartDataUid].maxFreightPrice) {
          newCartData[newCartDataUid].maxFreightPrice = freightPrice;
        }
        newCartData[newCartDataUid].productPrice += productPrice;
        newCartData[newCartDataUid].totalLittleFreight += freightPrice;
      }
    }
    // 检测限购
    for(let n in newCartData) {
      newCartData[n].carts = await db.ShopGoodsModel.checkOutPurchaseLimit(newCartData[n].carts, user.uid);
    }
    data.newCartData = newCartData;
    // 计算账单总价格
    // 取出全部收货地址
    let addresses = [];
    const userPersonal = await db.UsersPersonalModel.findOne({"uid":user.uid});
    if(userPersonal){
      addresses = userPersonal.addresses;
    }
    data.addresses = addresses;
    ctx.template = 'shop/bill/bill.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, query, body} = ctx;
    const {paraId, productCount} = body.post;
    ctx.template = 'shop/bill/bill.pug';
    await next();
  })
  .patch("/add", async(ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {productParamId, cartId, count} = body;
    let cart = await db.ShopCartModel.findOne({_id: cartId});
    // 检测商品库存
    let productParam = await db.ShopProductsParamModel.findOne({_id: productParamId});
    let paramCount = productParam.stocksSurplus;
    if(count > paramCount) {
      ctx.throw(400, "购买商品不得超当前库存");
    }
    // 检测限购
    const product = await db.ShopGoodsModel.findOne({productId: productParam.productId});
    data.sellUid = product.uid;
    data.productId = product.productId;
    if(product.purchaseLimitCount !== -1 && count > product.purchaseLimitCount) ctx.throw(400, `该商品最多可购买 ${product.purchaseLimitCount} 件`);
    // 计算小计价格(包括vip价格)
    let vipNum = 100;
    if(product.vipDiscount) {
      for(let v=0;v<product.vipDisGroup.length;v++) {
        if(data.user && data.user.authLevel == product.vipDisGroup[v].vipLevel) {
          vipNum = product.vipDisGroup[v].vipNum;
        }
      }
    }
    // 计算商品价格合计(含运费)
    data.singlePrices = count * (productParam.price * (vipNum / 100))
    // 计算运费
    let freightPrices = 0;
    if(!product.isFreePost) {
      freightPrices = product.freightPrice.firstFreightPrice + (product.freightPrice.addFreightPrice*(count-1));
    }
    data.freightPrices = freightPrices;
    // 修改购物车中的商品数量
    await cart.update({$set:{count: cart.count+1}});

    await next();
  })
  .patch("/plus", async(ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {productParamId, cartId, count} = body;
    let cart = await db.ShopCartModel.findOne({_id: cartId});
    let productParam = await db.ShopProductsParamModel.findOne({_id: productParamId});
    let product = await db.ShopGoodsModel.findOne({productId: productParam.productId});
    data.sellUid = product.uid;
    data.productId = product.productId;
    // 计算小计价格（包含vip折扣价）
    // 计算小计价格(包括vip价格)
    let vipNum = 100;
    if(product.vipDiscount) {
      for(let v=0;v<product.vipDisGroup.length;v++) {
        if(data.user && data.user.authLevel == product.vipDisGroup[v].vipLevel) {
          vipNum = product.vipDisGroup[v].vipNum;
        }
      }
    }
    // 计算商品价格合计(含运费)
    data.singlePrices = count * (productParam.price * (vipNum / 100));
    // 计算运费
    let freightPrices = 0;
    if(!product.isFreePost) {
      freightPrices = product.freightPrice.firstFreightPrice + (product.freightPrice.addFreightPrice*(count-1));
    }
    data.freightPrices = freightPrices;
    // 修改购物车中的商品数量
    await cart.update({$set:{count: cart.count-1}});
    await next();
  })
module.exports = router;