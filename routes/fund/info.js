const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'fund/info/info.pug';
		await next();
	});
module.exports = infoRouter;