const Router = require('koa-router');
const statusRouter = new Router();
statusRouter
	.get('/', async (ctx, next) => {
		const {data} = ctx;
		ctx.template = 'experimental/status/index.pug';
		data.type = 'status';
		await next();
	});
module.exports = statusRouter;