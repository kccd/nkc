const Router = require('koa-router');
const shelfRouter = new Router();
shelfRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
		ctx.template = 'shop/manage/shelf.pug';
		await next();
	})
module.exports = shelfRouter;