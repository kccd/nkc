const Router = require('koa-router');
const listRouter = new Router();
listRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		let {type, page} = query;
		data.type = type;
		if(page) {
			page = parseInt(page);
		} else {
			page = 0;
		}
		const q = {};
		if(type === 'unsolved') {
			q.resolved = {$ne: true};
		} else if(type === 'resolved') {
			q.resolved = true;
		}
		const count = await db.ProblemModel.count(q);
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		const problems = await db.ProblemModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.problems = await Promise.all(problems.map(async p => {
			await p.extendUser();
			await p.extendRestorer();
			return p;
		}));
		ctx.template = 'problem/problem_list.pug';
		data.resolvedCount = await db.ProblemModel.count({resolved: true});
		data.unsolvedCount = await db.ProblemModel.count({resolved: {$ne: true}});
		await next();
	})
	.get('/:_id', async (ctx, next) => {
		const {params, data, db} = ctx;
		const {_id} = params;
		data.problem = await db.ProblemModel.findOnly({_id});
		await data.problem.extendUser();
		await data.problem.extendRestorer();
		await data.problem.update({viewed: true});
		data.problem.viewed = true;
		ctx.template = 'problem/problem.pug';
		await next();
	})
	.patch('/:_id', async (ctx, next) => {
		const {params, data, db, body} = ctx;
		const {_id} = params;
		const {user} = data;
		const problem = await db.ProblemModel.findOnly({_id});
		const {solution, t, c, email} = body;
		if(!t) ctx.throw(400, '标题不能为空');
		if(!c) ctx.throw(400, '详细内容不能为空');
		/*if(email) {
			const {checkEmailFormat} = ctx.tools.checkString;
			if(checkEmailFormat(email) === -1) {
				ctx.throw(400, '邮箱格式不正确');
			}
		}*/
		body.resolveTime = Date.now();
		if(solution) {
			body.resolved = true;
			body.restorerId = user.uid;
		} else {
			body.resolved = false;
			body.restorerId = '';
		}
		await problem.update(body);
		await next();
	})
	.del('/:_id', async (ctx, next) => {
		const {params, db} = ctx;
		const {_id} = params;
		const problem = await db.ProblemModel.findOnly({_id});
		await problem.remove();
		await next();
	});
module.exports = listRouter;