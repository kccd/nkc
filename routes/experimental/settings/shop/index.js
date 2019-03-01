const Router = require('koa-router');
const applysRouter = require("./applys");
const homeSettingRouter = require("./homeSetting");
const shopRouter = new Router();
shopRouter
	.get('/', async (ctx, next) => {
		ctx.template = "experimental/shop/index.pug"
		await next();
	})
	.post('/', async (ctx, next) => {
		await next();
  })
	.use('/applys', applysRouter.routes(), applysRouter.allowedMethods())
	.use('/homeSetting', homeSettingRouter.routes(), homeSettingRouter.allowedMethods())
module.exports = shopRouter;