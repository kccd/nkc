const Router = require('koa-router');
const addRouter = new Router();
addRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'problem/add_problem.pug';
		const {data, query, db} = ctx;
		const {c, cid} = query;
		const typeId = Number(cid);
		if(typeId) {
      const problemsType = await db.ProblemsTypeModel.findOne({_id: typeId});
      if(problemsType) data.problemsType = problemsType;
    }
		data.c = c;
		await ctx.db.ProblemModel.ensureSubmitPermission({ip: ctx.address});
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		await db.ProblemModel.ensureSubmitPermission({ip: ctx.address});
		let {t, c, QQ, email, cid} = body;
		if(QQ) {
			QQ = parseInt(QQ);
		}
		if(email) {
			const {checkEmailFormat} = ctx.tools.checkString;
			if(checkEmailFormat(email) === -1) {
				ctx.throw(400, '邮箱格式不正确');
			}
		}
		if(!t) ctx.throw(400, '标题不能为空');
		if(!c) ctx.throw(400, '问题内容不能为空');
		const {user} = data;
		const _id = await db.SettingModel.operateSystemID('problems', 1);
		const obj = {
      _id,
      t,
      c,
      QQ,
      email,
      ip: ctx.address,
      port: ctx.port
    };
		if(user) {
		  obj.uid = user.uid;
		}
		if(cid) {
			const type = await db.ProblemsTypeModel.findOne({_id: Number(cid)});
		  obj.typeId = Number(type._id);
    }
		const newProblem = db.ProblemModel(obj);
		if(user) {
			await db.KcbsRecordModel.insertSystemRecord('reportIssue', user, ctx);
		}
		await newProblem.save();
		await next();
	});
module.exports = addRouter;