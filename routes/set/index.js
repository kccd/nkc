const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
	.use('/', async (ctx, next) => {
		const {url, data, db} = ctx;
		const {user} = data;
		let type = url.match(/\/set\/[a-z]+\?*/);
		if(!type) {
			type = 'info';
		} else {
			type = type[0];
			type = type.replace('/set/', '');
			type = type.replace('?', '');
		}
		data.type = type;
		await next();
	})
	.get(['/', '/info'], async (ctx, next) => {
		await next();
	})
	.get('/security', async (ctx, next) => {
		await next();
	})
	.get('/verify', async (ctx, next) => {
		const {query, data, db} = ctx;
		const {user} = data;
		const g = query.g?parseInt(query.g): 1;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const {idCardA, idCardB, handheldIdCard} = await userPersonal.extendIdPhotos();
		data.submittedAuth = userPersonal.submittedAuth;
		data.mobile = userPersonal.mobile;
		data.authLevel = await userPersonal.getAuthLevel();
		data.idCardA= idCardA;
		data.idCardB= idCardB;
		data.handheldIdCard = handheldIdCard;
		data.g = g;// grade,认证等级
		ctx.template = 'interface_set_verify.pug';
		await next();
	})
	.get('/cert', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.certsPhotos = await userPersonal.extendCertsPhotos();
		ctx.template = 'interface_set_cert.pug';
		await next();
	})
	.get('/album', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.lifePhotos = await userPersonal.extendLifePhotos();
		ctx.template = 'interface_set_album.pug';
		await next();
	});
module.exports = settingsRouter;