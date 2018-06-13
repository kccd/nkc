const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;
		const {page = 0} = query;
		const count = db.UsersBehaviorModel.count();
		const paging = nkcModules.apiFunction.paging(page, count);
		const behaviors = await db.UsersBehaviorModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.behaviors = await Promise.all(behaviors.map(async b => {
			await b.extendUser();
			await b.extendOperation();
			await b.extendTargetUser();
			await b.extend()
		}));
		ctx.template = 'experimental/log/experimental.pug';
		await next();
	});
module.exports = router;