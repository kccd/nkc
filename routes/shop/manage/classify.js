const Router = require('koa-router');
const classifyRouter = new Router();
classifyRouter
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const storeId = params.account;
		let store = await db.ShopStoresModel.findOne({storeId});
		data.store = store;
		ctx.template = 'shop/manage/classify.pug';
		await next();
	})
	.post('/add', async (ctx, next) => {
		const {data, db, body, params} = ctx;
    const {user} = data;
    const {newClassifyName} = body;
    const storeId = params.account;
    let store = await db.ShopStoresModel.findOne({storeId});
    for(let cla of store.storeClassifys){
      if(cla.name == newClassifyName) ctx.throw(400, "该分类已经存在")
    }
    const classify = {
      name: newClassifyName,
      productIds: []
    }
    store.storeClassifys.push(classify);
    await store.update({$set:{storeClassifys: store.storeClassifys}})
		await next();
  })
  .post('/del', async (ctx, next) => {
		const {data, db, body, params} = ctx;
    const {user} = data;
    const {classifyName} = body;
    const storeId = params.account;
    // question to be solved
    // 判断该分类下是否有商品，如果有，则不可删除
    let store = await db.ShopStoresModel.findOne({storeId});
    let claIndex;
    for(let cla in store.storeClassifys){
      if(classifyName == store.storeClassifys[cla].name){
        claIndex = cla
      }
    }
    store.storeClassifys.splice(claIndex, 1);
    await store.update({$set:{storeClassifys: store.storeClassifys}})
    await next();
  })
module.exports = classifyRouter;