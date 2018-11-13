const Router = require('koa-router');
const listRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
listRouter
	.get('/', async (ctx, next) => {
    const {query, data, db} = ctx;
		const page = query.page? parseInt(query.page): 0;
    const q = {};
		let activitys = await db.ActivityModel.find({"activityType":"release"}).sort({toc: 1});
		let total = 0;
		const count = activitys.length;
		const paging = apiFn.paging(page, count);
    data.paging = paging;
    data.activitys = activitys;
		ctx.template = 'activity/activityList.pug';
		await next();
	})
module.exports = listRouter;