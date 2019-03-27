const Router = require('koa-router');
const productRouter = new Router();
productRouter
  .get('/:productId', async (ctx, next) => {
    const {data, body, db, params, query} = ctx;
    // 获取商品id，并检查商品是否存在
    const {productId} = params;
    let {paraId} = query;
    const products = await db.ShopGoodsModel.find({productId});
    if(products.length == 0) ctx.throw(400, "商品不存在");
    const productArr = await db.ShopGoodsModel.extendProductsInfo(products);
    const product = productArr[0];
    data.product = product;
    // 选定规格
    let paId = 0;
    for(let a=0;a<product.productParams.length;a++){
      if(paraId == product.productParams[a]._id){
        paId = a;
      }
    }
    data.paId = paId;
    data.paraId = paraId;
    // 取出全部评论
    let match = {
      tid: data.product.tid,
      pid: {$nin:[data.product.oc]},
      disabled: false
    }
    const posts = await db.PostModel.find(match);
    data.posts = await db.PostModel.extendPosts(posts, {uid: data.user?data.user.uid: ''});
		// // 添加给被退回的post加上标记
		// const toDraftPosts = await db.DelPostLogModel.find({modifyType: false, postType: 'post', delType: 'toDraft', threadId: data.product.tid});
		// const toDraftPostsId = toDraftPosts.map(post => post.postId);
		// data.posts.map(async post => {
		// 	const index = toDraftPostsId.indexOf(post.pid);
		// 	if(index !== -1) {
		// 		post.todraft = true;
		// 		post.reason = toDraftPosts[index].reason;
		// 	}
		// });
    ctx.template = "shop/product/index.pug";
    await next();
  })
module.exports = productRouter;