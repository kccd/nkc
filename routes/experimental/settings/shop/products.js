const Router = require('koa-router');
const productsRouter = new Router();
productsRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;
		const {productType, page = 0} = query;
		data.productType = productType;

		// 取出全部商品贴
		const queryMap = {
			productStatus: 'insale'
		};
		if(productType === 'adminBan') {
			queryMap.adminBan = true;
		}

		const count = await db.ShopGoodsModel.countDocuments(queryMap);
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;

		const products = await db.ShopGoodsModel.find(queryMap).sort({toc: -1}).skip(paging.start).limit(paging.perpage);

		data.threads = [];

		const productsObj = {};
		const threadsId = [];
		for(const p of products) {
			if(!p.tid) continue;
			threadsId.push(p.tid);
			productsObj[p.tid] = p;
		}

		const threads = await db.ThreadModel.find({tid: {$in: threadsId}}).sort({toc: -1});

		await Promise.all(threads.map(async thread => {
			await thread.extendFirstPost();
			await thread.extendUser();
			const products = [productsObj[thread.tid]];
			let productArr = await db.ShopGoodsModel.extendProductsInfo(products);
			thread.product = productArr[0];
			data.threads.push(thread);
		}))
		ctx.template = "experimental/shop/products/products.pug"
		await next();
	})
	.put('/bansale', async(ctx, next) => {
		const {data, db, params, body, nkcModules} = ctx;
		const {productId} = body;
		const product = await db.ShopGoodsModel.findOne({productId: productId});
		if(product) {
			await product.updateOne({$set: {adminBan:true}});
		}
		await next();
	})
	.put("/clearban", async(ctx, next) => {
		const {data, db,params, body} = ctx;
		const {productId} = body;
		const product = await db.ShopGoodsModel.findOne({productId: productId});
		if(product) {
			await product.updateOne({$set: {adminBan: false}})
		}
	})
module.exports = productsRouter;
