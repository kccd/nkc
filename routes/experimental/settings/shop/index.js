const Router = require('koa-router');
const applysRouter = require("./applys");
const authRouter = require("./auth");
const refundsRouter = require("./refunds");
const productsRouter = require("./products");
const homeSettingRouter = require("./homeSetting");
const refundSettingsRouter = require("./refundSettings");
const shopRouter = new Router();
shopRouter
	.use('/', async (ctx, next) => {
		const {data,body,db} = ctx;
		let homeSetting = await db.ShopSettingsModel.findOne({type: "homeSetting"});
		if(!homeSetting){
			homeSetting = new db.ShopSettingsModel({});
			await homeSetting.save();
		}
		const applysDealing = await db.ShopApplyStoreModel.find({applyStatus: "dealing"});
		data.applysDealing = applysDealing;
		await next();
	})
	.get('/', async (ctx, next) => {
		ctx.template = "experimental/shop/index.pug"
		await next();
	})
	.post('/', async (ctx, next) => {
		await next();
  })
	.use('/applys', applysRouter.routes(), applysRouter.allowedMethods())
	.use('/auth', authRouter.routes(), authRouter.allowedMethods())
  .use('/refunds', refundsRouter.routes(), refundsRouter.allowedMethods())
  .use('/products', productsRouter.routes(), productsRouter.allowedMethods())
  .use('/refunds/settings', refundSettingsRouter.routes(), refundSettingsRouter.allowedMethods())
	.use('/homeSetting', homeSettingRouter.routes(), homeSettingRouter.allowedMethods())
module.exports = shopRouter;