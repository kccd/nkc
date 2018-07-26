const Router = require('koa-router');
const appRouter = new Router();
appRouter
	.get('/', async (ctx, next) => {
		await next();
	});
module.exports = appRouter;