const Router = require('koa-router');
const listRouter = new Router();
listRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;
		const {page = 0, c} = query;
		const match = {};
		if(c === 'unsolved') {
			match.resolved = false;
		}
		const count = await db.ProblemModel.countDocuments(match);
		const paging = nkcModules.apiFunction.paging(page, count, 100);
		const problems = await db.ProblemModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.problems = await Promise.all(problems.map(async p => {
			await p.extendUser();
			await p.extendRestorer();
			return p;
		}));
		ctx.template = 'problem/list.pug';
		data.paging = paging;
		data.c = c;
		await next();
	})
	/*.get('/', async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {cid = 0, page = 0} = query;
    const typeId = Number(cid);
    data.problemsType = await db.ProblemsTypeModel.findOnly({_id: typeId});
    const count = await db.ProblemModel.countDocuments({typeId});
    const paging = nkcModules.apiFunction.paging(page, count, 100);
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
    ctx.template = 'problem/list.pug';
    data.cid = typeId;
    data.paging = paging;
    await next();
  })*/
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
		const count = await db.ProblemModel.countDocuments(q);
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
		data.resolvedCount = await db.ProblemModel.countDocuments({resolved: true});
		data.unsolvedCount = await db.ProblemModel.countDocuments({resolved: {$ne: true}});
		await next();
	})*/
	.get('/:_id', async (ctx, next) => {
		const {params, data, db} = ctx;
		const {_id} = params;
		data.problem = await db.ProblemModel.findOnly({_id});
		data.problem.restorer = await db.UserModel.findOne({uid: data.problem.restorerId});;
		await data.problem.extendUser();
		await data.problem.extendRestorer();
		await data.problem.updateOne({viewed: true});
		data.problem.viewed = true;
		data.problemsTypes = await db.ProblemsTypeModel.find();
		ctx.template = 'problem/problem.pug';
		await next();
	})
	.put('/:_id', async (ctx, next) => {
		const {params, data, db, body} = ctx;
		const {user} = data;
		const {_id} = params;
		const problem = await db.ProblemModel.findOnly({_id});
		if (problem.resolved && user.uid != problem.restorerId) return await next();
		const {t, c, resolved, name, reminded} = body;
		const typeName = name.trim();
		// if(!t) ctx.throw(400, '标题不能为空');
		// if(!c) ctx.throw(400, '详细内容不能为空');
		// if(!restorLog) ctx.throw(400, '详细内容不能为空');
		const problemsType = await db.ProblemsTypeModel.findOnly({name: typeName});
		body.typeId = problemsType._id;
		body.resolveTime = Date.now();

		if(user) {
			body.restorerId = user.uid;
		} else {
			body.restorerId = '';
		}
		body.resolved = problem.resolved ? problem.resolved : body.resolved
		await problem.updateOne(body);
		// 更新数据库后 发送消息给问题提出者
		if (resolved && !problem.resolved && problem.uid && reminded) {
			const message = db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        r: problem.uid,
        ty: "STU",
        c: {
          type: "problemFixed",
          pid: problem._id
        }
      });
      await message.save();
      await ctx.redis.pubMessage(message);
		}
		await next();
	})
	.del('/:_id', async (ctx, next) => {
		const {params, db} = ctx;
		const {_id} = params;
		const problem = await db.ProblemModel.findOnly({_id});
		await problem.deleteOne();
		await next();
	});
module.exports = listRouter;
