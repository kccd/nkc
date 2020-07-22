const Router = require('koa-router');
const bannedRouter = new Router();
bannedRouter
	.put('/', async (ctx, next) => {
		const {db, params} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		if(!targetUser.certs.includes('banned')) ctx.throw(400, '该用户未被封禁');
		await targetUser.update({$pull: {certs: 'banned'}});
		await next();
		/*} else {
			if(certs.indexOf('moderator') >= 0 ||
				certs.indexOf('editor') >= 0 ||
				certs.indexOf('dev') >= 0 ||
				certs.indexOf('scholar') >= 0 ||
				targetUser.xsf > 0){
				if(data.userLevel < 6) {
					ctx.throw(403, '权限不足');
				}
			}
			if(targetUser.uid === data.user.uid) {
				ctx.throw(403, '为什么要封禁自己？');
			}
			if(certs.includes('banned')) {
				ctx.throw(400, '该用户已经被封禁，请刷新。');
			}
			await targetUser.update({$addToSet: {certs: 'banned'}});
		}
		await next();*/
	})
	.del('/', async (ctx, next) => {
		const {data, params, db} = ctx;
		const {user} = data;
		const {uid} = params;
		if(user.uid === uid) ctx.throw(400, '为什么要封禁自己？');
		const targetUser = await db.UserModel.findOnly({uid});
		const rolesId = data.userRoles.map(r => r._id);
		if(targetUser.certs.includes('dev') || targetUser.certs.includes('scholar') || targetUser.certs.includes('editor') || targetUser.certs.includes('moderator') || targetUser.xsf > 0) {
			if(!rolesId.includes('editor')) ctx.throw(403, '权限不足');
		}
		if(targetUser.certs.includes('banned')) ctx.throw(400, '该用户已被封禁');
		await targetUser.update({$addToSet: {certs: 'banned'}});
		await next();
	});
module.exports = bannedRouter;
