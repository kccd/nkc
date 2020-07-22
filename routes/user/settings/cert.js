const Router = require('koa-router');
const certRouter = new Router();
certRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.certsPhotos = await userPersonal.extendCertsPhotos();
		data.privacy = userPersonal.privacy;
		ctx.template = 'interface_user_settings_cert.pug';
		await next();
	})
	.put('/', async (ctx, next) => {
		const {body, data, db} = ctx;
		const {user} = data;
		const {displayPhoto} = body;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const {privacy} = userPersonal;
		privacy.certPhoto = displayPhoto;
		await userPersonal.update({privacy});
		await next();
	});
module.exports = certRouter;
