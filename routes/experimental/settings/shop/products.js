const Router = require('koa-router');
const productsRouter = new Router();
productsRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;
		const {productType, page = 0} = query;
		data.productType = productType;
		// 取出全部商品贴
		let queryMap = {
			type: "product"
		}
		const count = await db.ThreadModel.count(queryMap);
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;
		if(productType && productType == "adminBan") {
			queryMap.adminBan = true;
		}
		const threads = await db.ThreadModel.find(queryMap).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
		await Promise.all(threads.map(async thread => {
			await thread.extendFirstPost();
			await thread.extendUser();
			const products = await db.ShopGoodsModel.find({tid:thread.tid, oc:thread.firstPost.pid})
			let productArr = await db.ShopGoodsModel.extendProductsInfo(products);
			thread.product = productArr[0];
		}))
		data.threads = threads;
		ctx.template = "experimental/shop/products/products.pug"
		await next();
	})
	.patch('/bansale', async(ctx, next) => {
		const {data, db, params, body, nkcModules} = ctx;
		const {productId} = body;
		const product = await db.ShopGoodsModel.findOne({productId: productId});
		if(product) {
			await product.update({$set: {adminBan:true}});
		}
		await next();
	})
	.patch("/clearban", async(ctx, next) => {
		const {data, db,params, body} = ctx;
		const {productId} = body;
		const product = await db.ShopGoodsModel.findOne({productId: productId});
		if(product) {
			await product.update({$set: {adminBan: false}})
		}
	})
module.exports = productsRouter;