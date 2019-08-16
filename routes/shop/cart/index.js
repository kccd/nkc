const Router = require('koa-router');
const router = new Router();
const singleCartRouter = require('./singleCart');
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    let carts = await db.ShopCartModel.find({
      uid: user.uid
    }).sort({toc: -1});
    carts = await db.ShopCartModel.extendCartsInfo(carts);
    let newCarts = [];
    for(const c of carts) {
      if(!c.productParam) {
        await db.ShopCartModel.remove({_id: c._id});
      }else{
        newCarts.push(c);
      }
    }
    const productUsers = {};
    for(const cart of newCarts) {
      const productUserId = cart.product.uid;
      if(!productUsers[productUserId]) {
        productUsers[productUserId] = {
          user: cart.product.user,
          products: [cart]
        }
      } else {
        productUsers[productUserId].products.push(cart);
      }
    }
    const cartData = [];
    for(const key in productUsers) {
      if(!productUsers.hasOwnProperty(key)) continue;
      const r = productUsers[key];
      cartData.push({
        user: r.user,
        products: r.products
      });
    }
    data.cartData = cartData;
    ctx.template = 'shop/cart/cart.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {productParamId, count, freightId} = body;
    if(!productParamId) ctx.throw(400, '规格id不能为空');
    if(count < 1) ctx.throw(400, '添加到购物城的商品数量不能小于1');
    const productParam = await db.ShopProductsParamModel.findById(productParamId);
    if(productParam.stocksSurplus <= 0) ctx.throw(400, '该规格的商品库已经卖光了，暂无法添加到购物车，请选择其他商品规格。');
    const {productId} = productParam;
    const product = await db.ShopGoodsModel.findById(productId);
    if(product.productStatus == "stopsale") ctx.throw(400, "该商品停售中，不可加入购物车");
    await product.ensurePermission();
    if(user) {
      let cart = await db.ShopCartModel.findOne({productId, productParamId, uid: user.uid});
      // 若商品已存在则数量+1，若商品不存在则添加
      if(cart) {
        await cart.update({$inc: {count: count}, toc: Date.now()});
      } else {
        cart = db.ShopCartModel({
          _id: await db.SettingModel.operateSystemID('shopCarts', 1),
          uid: user.uid,
          productParamId,
          productId,
          freightId,
          count
        });
        await cart.save();
      }
    } else {
      let cartInfo = ctx.cookies.get('cartInfo', {
        signed: true
      });
      if(cartInfo) {
        cartInfo = Buffer.from(cartInfo, 'hex');
        cartInfo = cartInfo.toString();
        cartInfo = JSON.parse(cartInfo);
      } else {
        cartInfo = [];
      }
      let has = false;
      for(const c of cartInfo) {
        if(c.productId === productId && c.productParamId === productParamId) {
          has = true;
          c.count += count;
          c.toc = Date.now();
        }
      }
      if(!has) {
        cartInfo.push({
          productId,
          productParamId,
          count,
          toc: Date.now()
        });
      }
      cartInfo = Buffer.from(JSON.stringify(cartInfo)).toString('hex');
      ctx.cookies.set('cartInfo', cartInfo, {
        signed: true
      });
    }
    await next();
  })
  .use('/:_id', singleCartRouter.routes(), singleCartRouter.allowedMethods());
module.exports = router;