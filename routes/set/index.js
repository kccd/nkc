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
		if(g === 1) {

		} else if(g === 2) {
			const {idCardPhotos} = userPersonal.privateInfo;
			const idCardAPhoto = await db.PhotoModel.findOne({_id: idCardPhotos[0]});
			const idCardBPhoto = await db.PhotoModel.findOne({_id: idCardPhotos[1]});
			data.idCardPhotos = [idCardAPhoto, idCardBPhoto];
		} else if(g === 3) {
			const {handheldIdCardPhoto} = userPersonal.privateInfo;
			data.handheldIdCardPhoto = await db.PhotoModel.findOne({_id: handheldIdCardPhoto});
		}
		data.g = g;// grade,认证等级
		ctx.template = 'interface_set_verify.pug';
		await next();
	})
	.get('/cert', async (ctx, next) => {
		ctx.template = 'interface_set_cert.pug';
		await next();
	})
	.get('/album', async (ctx, next) => {
		ctx.template = 'interface_set_album.pug';
		await next();
	});
module.exports = settingsRouter;