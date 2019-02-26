const Router = require('koa-router');
const applysRouter = require("./applys");
const shopRouter = new Router();
shopRouter
	.get('/', async (ctx, next) => {
		console.log("1")
		ctx.template = "experimental/shop/index.pug"
		await next();
	})
	.post('/', async (ctx, next) => {
		await next();
  })
	.use('/applys', applysRouter.routes(), applysRouter.allowedMethods())
module.exports = shopRouter;