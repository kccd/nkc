const Router = require('koa-router');
const router = new Router();
router
	.post('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
		const forum = await thread.extendForum();
		const isModerator = await forum.isModerator(user?user.uid: '');
		if(!isModerator) {
			if(!data.userOperationsId.includes('digestThread')) {
				ctx.throw(403, '您没有权限给该文章加精');
			}
		}
		if(thread.digest) ctx.throw(400, '文章已被设置精华');
		await thread.update({digest: true});
		await next();
	})
	.del('/', async (ctx ,next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
		const forum = await thread.extendForum();
		const isModerator = await forum.isModerator(user?user.uid: '');
		if(!isModerator) {
			if(!data.userOperationsId.includes('unDigestThread')) {
				ctx.throw(400, '您没有权限给该文章取消加精');
			}
		}
		if(!thread.digest) ctx.throw(400, '文章未被设置精华');
		await thread.update({digest: false});
		await next();
	});
module.exports = router;