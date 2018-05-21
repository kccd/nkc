const Router = require('koa-router');
const listRouter = new Router();
listRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		let {type, page} = query;
		if(page) {
			page = parseInt(page);
		} else {
			page = 0;
		}
		const q = {};
		if(type === 'r') {
			q.repairUid = {$ne: ''}
		} else if(type === 'n') {
			q.repairUid = '';
		}
		const count = await db.ProblemModel.count(q);
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		data.problems = await db.ProblemModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		ctx.template = 'problem/problem_list.pug';
		await next();
	})
	.get('/:_id', async (ctx, next) => {
		const {params, data, db} = ctx;
		const {_id} = params;
		data.problem = await db.ProblemModel.findOnly({_id});
		ctx.template = 'problem/problem.pug';
		await next();
	});
module.exports = listRouter;