const Router = require('koa-router');
const userRouter = new Router();
const postsRouter = require('./posts');
userRouter
	.get('/:uid', async (ctx, next) => {
		const {params, data, db} = ctx;
		const {uid} = params;
		data.targetUser = await db.UserModel.findOnly({uid});
		await next();
	})
	.use('/:uid/posts', postsRouter.routes(), postsRouter.allowedMethods());
module.exports = userRouter;