const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
	.post('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {fid} = params;
		const {user} = data;
		const forum = await db.ForumModel.findOnly({fid});
		const gradeId = data.userGrade._id;
		const rolesId = data.userRoles.map(r => r._id);
		const options = {
			gradeId,
			rolesId,
			uid: user?user.uid: ''
		};
		await forum.ensurePermissionNew(options);
		const childrenForums = await forum.extendChildrenForums();
		if(childrenForums.length !== 0) {
			ctx.throw(400, '该专业下存在其他专业，无法关注。');
		}

		const userSubscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
		const {subscribeForums} = userSubscribe;
		if(subscribeForums.length >= 20) {
			ctx.throw(400, '每个用户最多只能关注20个领域。')
		}
		if(subscribeForums.includes(fid)) {
			ctx.throw(400, '您已经关注该领域，请刷新。');
		}
		await userSubscribe.update({$addToSet: {subscribeForums: fid}});
		await forum.update({$addToSet: {followersId: user.uid}});
		await next();
	})
	.del('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const {fid} = params;
		const forum = await db.ForumModel.findOnly({fid});
		const userSubscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
		await userSubscribe.update({$pull: {subscribeForums: fid}});
		await forum.update({$pull: {followersId: user.uid}});
		await next();
	});
module.exports = subscribeRouter;