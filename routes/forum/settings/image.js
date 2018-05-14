const Router = require('koa-router');
const imageRouter = new Router();
imageRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_forum_settings_image.pug';
		await next();
	});
module.exports = imageRouter;