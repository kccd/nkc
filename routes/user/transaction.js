const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		data.targetUser = await db.UserModel.findOnly({uid});
    await data.targetUser.extendGrade();
    await db.UserModel.extendUsersInfo([data.targetUser]);
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		data.addresses = targetUserPersonal.addresses;
		data.personalInfo = targetUserPersonal.personalInfo;
		ctx.template = 'user/transaction.pug';
		await next();
	});
module.exports = router;