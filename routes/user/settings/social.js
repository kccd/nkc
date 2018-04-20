const Router = require('koa-router');
const socialRouter = new Router();
socialRouter
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		data.accounts = userPersonal.accounts;
		ctx.template = 'interface_user_settings_social.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body, params} = ctx;
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		const {accounts} = body;
		await userPersonal.update({accounts});
		await next();
	});
module.exports = socialRouter;