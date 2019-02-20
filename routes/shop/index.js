const Router = require('koa-router');
const shopRouter = new Router();
const productRouter = require('./product');
const manageRouter = require('./manage');
shopRouter
  .get('/', async (ctx, next) => {
    ctx.template = "shop/index.pug";
    await next();
  })
	.use('/product', productRouter.routes(), productRouter.allowedMethods())
	.use('/manage', manageRouter.routes(), manageRouter.allowedMethods())
module.exports = shopRouter;