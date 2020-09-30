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
		const {data, db} = ctx;
		let homeSetting = await db.ShopSettingsModel.findOne({type: "homeSetting"});
		if(!homeSetting){
			homeSetting = new db.ShopSettingsModel({});
			await homeSetting.save();
		}
		data.applysDealing = await db.ShopApplyStoreModel.find({applyStatus: "dealing"});
		data.shopSettings = await db.SettingModel.getSettings('shop');
		await next();
	})
	.get('/', async (ctx, next) => {
		ctx.template = "experimental/shop/base/base.pug"
		await next();
	})
	.put('/', async (ctx, next) => {
		const {db, body, nkcModules} = ctx;
		const {shopSettings} = body;
		const {closeSale} = shopSettings;
		const {checkNumber, checkString} = nkcModules.checkData;
		checkNumber(closeSale.lastVisitTime, {
			name: '活动时间',
			min: 0.01,
			fractionDigits: 2,
		});
		checkString(closeSale.description, {
			name: '受限时的提示',
			min: 1,
			max: 500
		});
		await db.SettingModel.updateOne({_id: 'shop'}, {
			$set: {
				'c.closeSale': closeSale
			}
		});
		await db.SettingModel.saveSettingsToRedis('shop');
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
