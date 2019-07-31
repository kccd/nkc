const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data, nkcModules} = ctx;
		const {forum} = data;
		await forum.extendValuableThreads();
		await forum.extendBasicThreads();
		data.type = 'home';
		if(forum.valuableThreads.length === 0 &&
			forum.basicThreads.length === 0 &&
			!forum.declare
		) {
			if(ctx.query.token) {
				return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/f/${forum.fid}/latest?token=${ctx.query.token}`));
			}else{
				return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/f/${forum.fid}/latest`));
			}
		}
		await next();
	});
module.exports = homeRouter;