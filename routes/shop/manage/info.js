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
		const {location, storeDescription, storeName} = body;
		const storeId = params.account;
		let store = await db.ShopStoresModel.findOne({storeId});
		if(!store || storeId !== store.storeId) ctx.throw(400, "您无对该店铺的管理权限");
		let addressArray = [];
		addressArray.push(location)
		await store.update({$set:{storeName:storeName, storeDescription:storeDescription,dataPerfect:true,address:addressArray}});
		await next();
	})
module.exports = infoRouter;