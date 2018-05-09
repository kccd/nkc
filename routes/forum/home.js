const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {forum} = data;
		const extend = async (threads) => {
			await Promise.all(threads.map(async thread => {
				await thread.extendFirstPost().then(p => p.extendUser());
				await thread.extendLastPost().then(p => p.extendUser());
				await thread.extendForum().then(f => f.extendParentForum());
			}));
		};
		await forum.extendValuableThreads();
		await forum.extendBasicThreads();
		await forum.extendNoticeThreads();
		await extend(forum.valuableThreads);
		await extend(forum.basicThreads);
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