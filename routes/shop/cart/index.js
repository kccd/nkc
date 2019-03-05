const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const carts = await db.ShopCartModel.find({
      uid: user.uid
    }).sort({toc: -1});
    data.carts = await db.ShopCartModel.extendCarts(carts);
    ctx.template = 'shop/cart/cart.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {productId} = body;
    const product = await db.ShopGoodsModel.findOne({productId});
    if(!product) ctx.throw(400, '添加失败，商品不存在或已下架');
    if(user) {
      let cart = await db.ShopCartModel.findOne({productId, uid: user.uid});
      // 若商品已存在则数量+1，若商品不存在则添加
      if(cart) {
        await cart.update({$inc: {count: 1}});
      } else {
        cart = db.ShopCartModel({
          _id: await db.SettingModel.operateSystemID('shopCarts', 1),
          uid: user.uid,
          productId
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
      cartInfo.push(productId);
      cartInfo = Buffer.from(JSON.stringify(cartInfo)).toString('hex');
      ctx.cookies.set('cartInfo', cartInfo, {
        signed: true
      });
    }
    await next();
  });
module.exports = router;