const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
		ctx.template = 'shop/manage/home.pug';
		await next();
	})
module.exports = homeRouter;