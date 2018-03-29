const Router = require('koa-router');
const logRouter = new Router();
logRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const page = query.page?parseInt(query.page): 0;
		const count = await db.LogModel.count({});
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		const logs = await db.LogModel.find().sort({reqTime: -1}).skip(paging.start).limit(paging.perpage);
		data.logs = await Promise.all(logs.map(async log => {
			await log.extendUser();
			return log;
		}));
		ctx.template = 'interface_log.pug';
		data.nav = '日志';
		await next();
	});
module.exports = logRouter;