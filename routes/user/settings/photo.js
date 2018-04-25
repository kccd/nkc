const Router = require('koa-router');
const photoRouter = new Router();
photoRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.lifePhotos = await userPersonal.extendLifePhotos();
		data.privacy = userPersonal.privacy;
		ctx.template = 'interface_user_settings_photo.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {body, data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const {displayPhoto} = body;
		const {privacy} = userPersonal;
		privacy.lifePhoto = displayPhoto;
		await userPersonal.update({privacy});
		await next();
	});
module.exports = photoRouter;