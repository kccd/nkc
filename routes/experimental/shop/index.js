const Router = require('koa-router');
const shopRouter = new Router();
const homeRouter = require('./home');
// const emailRouter = require('./email');
shopRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.post('/', async (ctx, next) => {
		await next();
	})
  .use('/home', homeRouter.routes(), homeRouter.allowedMethods())
	// .use('/forum', forumRouter.routes(), forumRouter.allowedMethods());
module.exports = shopRouter;