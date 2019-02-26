const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
		ctx.template = 'shop/manage/info.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		const {user} = data;
		// 验证是否有操作该店铺的权限
		// 待定
		let newProductInfo = body.post;
		const storeId = params.account;
		const productId = await db.SettingModel.operateSystemID('products', 1);
		newProductInfo.uid = user.uid;
		newProductInfo.storeId = storeId;
		newProductInfo.productId = productId;
		const newProduct = new db.ShopGoodsModel(newProductInfo);
		newProduct.save();
		await next();
	})
module.exports = infoRouter;