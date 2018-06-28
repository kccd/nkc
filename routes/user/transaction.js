const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		data.targetUser = await db.UserModel.findOnly({uid});
		await data.targetUser.extendGrade();
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		data.addresses = targetUserPersonal.addresses;
		data.targetUserSubscribe = await db.UsersSubscribeModel.findOnly({uid});
		ctx.template = 'user/transaction.pug';
		await next();
	});
module.exports = router;