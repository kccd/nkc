const Router = require('koa-router');
const verifyRouter = new Router();
verifyRouter
	.use('/:level', async (ctx, next) => {
		const {params, data} = ctx;
		data.level = params.level;
		await next();
	})
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    const {idCardA, idCardB, handheldIdCard} = await userPersonal.extendIdPhotos();
    data.submittedAuth = userPersonal.submittedAuth;
    data.idCardA = idCardA;
    data.idCardB = idCardB;
    data.handheldIdCard = handheldIdCard;
    ctx.template = "interface_user_settings_verify.pug";
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
		const authLevel = await userPersonal.getAuthLevel();
		if(authLevel < 1) {
			ctx.throw(403, '您暂未通过身份认证1。');
		}
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
		const authLevel = await userPersonal.getAuthLevel();
		if(authLevel < 2) {
			ctx.throw(403, '您暂未通过身份认证2。');
		}
		const {handheldIdCard} = await userPersonal.extendIdPhotos();
		data.submittedAuth = userPersonal.submittedAuth;
		data.handheldIdCard = handheldIdCard;
		data.level = 3;
		ctx.template = 'interface_user_settings_verify.pug';
		await next();
	});
module.exports = verifyRouter;