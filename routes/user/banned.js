const Router = require('koa-router');
const bannedRouter = new Router();
bannedRouter
	.patch('/', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		if(data.userLevel < 4) ctx.throw(403, '权限不足');
		const {banned} = body;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		const {certs} = targetUser;
		if(!banned) {
			if(data.userLevel === 4) ctx.throw(403, '权限不足');
			if(!certs.includes('banned')) {
				ctx.throw(400, '该用户未被封禁，请刷新。');
			}
			await targetUser.update({$pull: {certs: 'banned'}});
		} else {
			if(certs.indexOf('moderator') >= 0 ||
				certs.indexOf('editor') >= 0 ||
				certs.indexOf('dev') >= 0 ||
				certs.indexOf('scholar') >= 0 ||
				targetUser.xsf > 0){
				if(data.userLevel < 6) {
					ctx.throw(403, '权限不足');
				}
			}
			if(certs.includes('banned')) {
				ctx.throw(400, '该用户已经被封禁，请刷新。');
			}
			await targetUser.update({$addToSet: {certs: 'banned'}});
		}
		await next();
	});
module.exports = bannedRouter;