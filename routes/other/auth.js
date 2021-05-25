const Router = require('koa-router');
const authRouter = new Router();
authRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const userPersonalArr = await db.UsersPersonalModel.find({
			$or: [
				{"authenticate.card.status": "in_review"},
				{"authenticate.video.status": "in_review"}
			]
		}).sort({toc: 1});
		
		data.usersAuth = await Promise.all(userPersonalArr.map(async user => {
			let authLevel = 2;
			if(user.authenticate.video.status === "in_review") {
				authLevel = 3;
			}
			if(user.authenticate.card.status === "in_review") {
				authLevel = 2;
			}
			const targetUser = await db.UserModel.findOne({uid: user.uid}, { uid: true, username: true });
			return {
				authLevel,
				targetUser
			}
		}));
		ctx.template = 'interface_auth.pug';
		await next();
	});
module.exports = authRouter;