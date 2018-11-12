const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data} = ctx;
		const {forum} = data;
		await forum.extendValuableThreads();
		await forum.extendBasicThreads();
		data.type = 'home';
		if(forum.valuableThreads.length === 0 &&
			forum.basicThreads.length === 0 &&
			!forum.declare
		) {
			return ctx.redirect(`/f/${forum.fid}/latest`);
		}
		await next();
	});
module.exports = homeRouter;