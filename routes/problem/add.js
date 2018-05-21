const Router = require('koa-router');
const addRouter = new Router();
addRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'problem/add_problem.pug';
		await ctx.db.ProblemModel.ensureSubmitPermission({ip: ctx.address});
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		await db.ProblemModel.ensureSubmitPermission({ip: ctx.address});
		let {t, c, QQ, email} = body;
		if(QQ) {
			QQ = parseInt(QQ);
		}
		if(email) {
			const {checkEmailFormat} = ctx.tools.checkString;
			console.log(checkEmailFormat(email));
			if(checkEmailFormat(email) === -1) {
				ctx.throw(400, '邮箱格式不正确');
			}
		}
		if(!t) ctx.throw(400, '标题不能为空');
		if(!c) ctx.throw(400, '问题内容不能为空');
		const {user} = data;
		const _id = await db.SettingModel.operateSystemID('problems', 1);
		const newProblem = db.ProblemModel({
			_id,
			t,
			c,
			QQ,
			email,
			ip: ctx.address,
			port: ctx.port
		});
		if(user) {
			newProblem.uid = user.uid;
		}
		await newProblem.save();
		await next();
	});
module.exports = addRouter;