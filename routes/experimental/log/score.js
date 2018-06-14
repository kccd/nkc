const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		ctx.template = 'experimental/log/score.pug';
		const {nkcModules, data, db, query} = ctx;
		const {page = 0, type} = query;
		data.type = type;
		const q = {};
		if(type) {
			q.type = type;
		}
		const count = await db.UsersScoreLogModel.count(q);
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;
		const logs = await db.UsersScoreLogModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.logs = await Promise.all(logs.map(async log => {
			await log.extendOperation();
			await log.extendUser();
			await log.extendTargetUser();
			return log;
		}));
		await next();
	});
module.exports = router;