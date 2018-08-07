const Router = require('koa-router');
const personalRouter = new Router();
personalRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		if(!user) ctx.throw(403, '权限不足');
		let userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		userPersonal = userPersonal.toObject();
		const s1 = delete userPersonal.password;
		const s2 = delete userPersonal.hashType;
		data.userPersonal = userPersonal;
		await next();
	});
module.exports = personalRouter;
