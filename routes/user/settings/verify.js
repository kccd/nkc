const Router = require('koa-router');
const verifyRouter = new Router();
verifyRouter
	.use('/:level', async (ctx, next) => {
		const {params, data} = ctx;
		data.level = params.level;
		await next();
	})
	.get('/1', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.mobile = userPersonal.mobile;
		ctx.template = 'interface_user_settings_verify.pug';
		data.level = 1;
		await next();
	})
	.get('/2', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const {idCardA, idCardB} = await userPersonal.extendIdPhotos();
		data.submittedAuth = userPersonal.submittedAuth;
		data.idCardA = idCardA;
		data.idCardB = idCardB;
		data.level = 2;
		ctx.template = 'interface_user_settings_verify.pug';
		await next();
	})
	.get('/3', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const {handheldIdCard} = await userPersonal.extendIdPhotos();
		data.submittedAuth = userPersonal.submittedAuth;
		data.handheldIdCard = handheldIdCard;
		data.level = 3;
		ctx.template = 'interface_user_settings_verify.pug';
		await next();
	});
module.exports = verifyRouter;