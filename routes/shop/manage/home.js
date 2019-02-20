const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
    console.log("店铺首页")
		ctx.template = 'shop/manage/home.pug';
		await next();
	})
module.exports = homeRouter;