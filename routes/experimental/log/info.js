const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;
		const {page = 0, type} = query;
		data.type = type;
		const q = {};
		if(type === 'thread') {
			q.operationId = 'postToForum';
		} else if(type === 'post') {
			q.operationId = 'postToThread';
		}
		const count = await db.InfoBehaviorModel.count(q);
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;
		const behaviors = await db.InfoBehaviorModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.behaviors = await Promise.all(behaviors.map(async behavior => {
			await behavior.extendUser();
			await behavior.extendOperation();
			await behavior.extendPost();
			return behavior;
		}));
		ctx.template = 'experimental/log/info.pug';
		await next();
	});
module.exports = router;