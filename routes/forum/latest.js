const Router = require('koa-router');
const latestRouter = new Router();
latestRouter
	.get('/', async (ctx, next) => {
		const url = ctx.url.replace("/latest", "");
		ctx.statue = 301;
		return ctx.redirect(url);
	});
module.exports = latestRouter;
