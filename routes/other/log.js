const Router = require('koa-router');
const logRouter = new Router();
logRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_log.pug';
		await next();
	});
module.exports = logRouter;