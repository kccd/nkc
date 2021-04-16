const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    let {
      cartsId, paraId, productCount, freightId
    } = query;
    let billType;
    paraId = Number(paraId);
    // 整理购物车数据
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
      data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData, {
        userGradeId: data.user.grade._id
      });
    } else {
      billType = "cart";
      cartsId = cartsId.split('-');
      const cartsData = await db.ShopCartModel.find({_id: {$in: cartsId}});
      data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData, {
        userGradeId: data.user.grade._id
      });
    }
    data.billType = billType;

    // 将商品按店家分类，将规格按商品分类
    const usersObj = {}, productsObj = {}, paramsObj  = {};
    for(const cart of data.cartsData) {
      const {product, productParam, count, _id} = cart;
      usersObj[product.uid] = {
        user: product.user,
        products: []
      };
      productsObj[product.productId] = {
        product,
        freight: product.isFreePost? "": product.freightTemplates[0],
        params: []
      };
      paramsObj[productParam._id] = {
        productParam,
        cartId: _id,
        price: productParam.useDiscount? productParam.price: productParam.originPrice,
        count
      };
    }
    for(const paramId in paramsObj) {
      if(!paramsObj.hasOwnProperty(paramId)) continue;
      const param = paramsObj[paramId];
      const product = productsObj[param.productParam.productId];
      let vipNum = 100;
      // 会员折扣
      if(product.product.vipDiscount) {
        const gradeId = user.grade._id;
        for(const v of product.product.vipDisGroup) {
          if((v.vipLevel + "") === (gradeId + "")) {
            vipNum = v.vipNum;
            break;
          }
        }
      }
      param.price =  parseInt(param.productParam.price * vipNum / 100);
      product.params.push(param);
    }
    for(const productId in productsObj) {
      if(!productsObj.hasOwnProperty(productId)) continue;
      const product = productsObj[productId];
      const user = usersObj[product.product.uid];
      user.products.push(product);
    }
    data.results = [];
    for(const userId in usersObj) {
      if(!usersObj.hasOwnProperty(userId)) continue;
      data.results.push(usersObj[userId]);
    }
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
					if(data.user && data.user.grade._id === (cart.product.vipDisGroup[v].vipLevel + 1)) {
						vipNum = cart.product.vipDisGroup[v].vipNum;
					}
        }
        cart.vipDiscount = true;
      }else{
        cart.vipDiscount = true;
      }
      cart.vipNum = vipNum;
      // 计算商品价格合计(含运费)
      if(!cart.productParam) ctx.throw(400, "商品规格信息已更新，请重新选择");
      let productPrice = cart.count * (cart.productParam.price * (vipNum / 100));
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
    const userPersonal = await db.UsersPersonalModel.findOnly({"uid": user.uid});
    data.addresses = userPersonal.addresses || [];
    ctx.template = 'shop/bill/bill.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, query, body} = ctx;
    const {paraId, productCount} = body.post;
    ctx.template = 'shop/bill/bill.pug';
    await next();
  })
  .put("/add", async(ctx, next) => {
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
    await cart.updateOne({$set:{count: cart.count+1}});

    await next();
  })
  .put("/plus", async(ctx, next) => {
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
    await cart.updateOne({$set:{count: cart.count-1}});
    await next();
  })
module.exports = router;
