const Router = require('koa-router');
const pageRouter = new Router();
pageRouter
	.get('/faq', async (ctx, next) => {
		return ctx.redirect(`/p/822194`)
	});
module.exports = pageRouter;