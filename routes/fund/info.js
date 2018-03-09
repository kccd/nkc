const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_fund_general_info.pug';
		await next();
	});
module.exports = infoRouter;