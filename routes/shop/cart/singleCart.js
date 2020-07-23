const Router = require('koa-router');
const router = new Router();
router
  .put('/', async (ctx, next) => {
    const {db, data, body, params} = ctx;
    const {type, count} = body;
    const {_id} = params;
    const cart = await db.ShopCartModel.findById(_id);
    if(type === 'reduceCount') {
      if(cart.count > 1) {
        cart.count --;
      }
    } else if(type === 'addCount') {
      cart.count ++;
    } else if(type === 'changeCount') {
      if(count < 0) ctx.throw(400, '数量不能小于0');
      cart.count = count;
    }
    await cart.save();
    data.count = cart.count;
    await next();
  })
  .del('/', async (ctx, next) => {
    const {db, params} = ctx;
    const {_id} = params;
    const cart = await db.ShopCartModel.findById(_id);
    await cart.remove();
    await next();
  });
module.exports = router;
