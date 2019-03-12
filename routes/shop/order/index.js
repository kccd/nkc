const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    let {cartsId} = query;
    cartsId = cartsId.split('-');
    const cartsData = await db.ShopCartModel.find({_id: {$in: cartsId}});
    data.cartsData = await db.ShopCartModel.extendCartsInfo(cartsData);
    ctx.template = 'shop/order/order.pug';
    await next();
  });
module.exports = router;