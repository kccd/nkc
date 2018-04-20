const Router = require('koa-router');
const authRouter = new Router();
authRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const userPersonalArr = await db.UsersPersonalModel.find({submittedAuth: true}).sort({toc: 1});
		data.usersAuth = await Promise.all(userPersonalArr.map(async u => {
			const authLevel = await u.getAuthLevel();
			const targetUser = await db.UserModel.findOnly({uid: u.uid});
			return {
				authLevel,
				targetUser
			}
		}));
		ctx.template = 'interface_auth.pug';
		await next();
	});
module.exports = authRouter;