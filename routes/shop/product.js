const Router = require('koa-router');
const productRouter = new Router();
productRouter
  .get('/', async (ctx, next) => {
    ctx.template = "shop/product/index.pug";
    await next();
  })
module.exports = productRouter;