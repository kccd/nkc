const Router = require('koa-router');
const privateInfoRouter = new Router();
privateInfoRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		ctx.template = 'interface_user_privateInfo.pug';
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.privateInfo = userPersonal.privateInfo;
		await next();
	});
module.exports = privateInfoRouter;