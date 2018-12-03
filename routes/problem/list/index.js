const Router = require('koa-router');
const listRouter = new Router();
listRouter
  .get('/', async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {cid = 0, page = 0} = query;
    const typeId = Number(cid);
    data.problemsType = await db.ProblemsTypeModel.findOnly({_id: typeId});
    const count = await db.ProblemModel.count({typeId});
    const paging = nkcModules.apiFunction.paging(page, count);
    data.problemsTypes = await db.ProblemsTypeModel.find({}).sort({order: 1});
    for(const type of data.problemsTypes) {
      await type.updateProblemsCount();
    }
    const problems = await db.ProblemModel.find({typeId}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.problems = await Promise.all(problems.map(async p => {
      await p.extendUser();
      await p.extendRestorer();
      return p;
    }));
    ctx.template = 'problem/problem_list.pug';
    data.cid = typeId;
    data.paging = paging;
    await next();
  })
	/*.get('/', async (ctx, next) => {
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
	})*/
	.get('/:_id', async (ctx, next) => {
		const {params, data, db} = ctx;
		const {_id} = params;
		data.problem = await db.ProblemModel.findOnly({_id});
		await data.problem.extendUser();
		await data.problem.extendRestorer();
		await data.problem.update({viewed: true});
		data.problem.viewed = true;
		data.problemsTypes = await db.ProblemsTypeModel.find();
		ctx.template = 'problem/problem.pug';
		await next();
	})
	.patch('/:_id', async (ctx, next) => {
		const {params, data, db, body} = ctx;
		const {_id} = params;
		const {user} = data;
		const problem = await db.ProblemModel.findOnly({_id});
		const {t, c, resolved, name} = body;
		const typeName = name.trim();
		if(!t) ctx.throw(400, '标题不能为空');
		if(!c) ctx.throw(400, '详细内容不能为空');
    const problemsType = await db.ProblemsTypeModel.findOnly({name: typeName});
		body.resolveTime = Date.now();
		if(user && resolved) {
			body.restorerId = user.uid;
		} else {
			body.restorerId = '';
		}
		body.typeId = problemsType._id;
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