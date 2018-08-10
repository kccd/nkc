const Router = require('koa-router');
const userRouter = new Router();
const postsRouter = require('./posts');
const subscribeRouter = require('./subscribe');

userRouter
	.get('/:uid', async (ctx, next) => {
		const {params, data, db} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		await targetUser.extendGrade();
		data.targetUser = targetUser.toObject();
		await next();
	})
	.use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
	.use('/:uid/posts', postsRouter.routes(), postsRouter.allowedMethods());
module.exports = userRouter;