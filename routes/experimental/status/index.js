const Router = require('koa-router');
const statusRouter = new Router();
statusRouter
	.get('/', async (ctx, next) => {
		const {query, data} = ctx;
		ctx.template = 'experimental/status/index.pug';
		data.type = 'status';
		const {type} = query;
		if(type === 'today') {
			data.results = {a: 234234234};
		}
		await next();
	});
module.exports = statusRouter;