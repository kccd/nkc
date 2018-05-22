const Router = require('koa-router');
const usersRouter = new Router();
usersRouter
	.get('/', async (ctx, next) => {
		const {data, query} = ctx;
		let {page} = query;
		const {role} = data;
		if(role._id === 'visitor') {
			return ctx.redirect(`/e/settings/role/visitor/base`);
		}
		if(page) {
			page = parseInt(page);
		} else {
			page = 0;
		}
		const count = await role.extendUserCount();
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		const users = await role.getUsers(paging);
		data.users = await Promise.all(users.map(async user => {
			await user.extend();
			return user;
		}));
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body, params, data} = ctx;
		const {operation} = body;
		const {_id} = params;
		const role = await db.RoleModel.findOnly({_id});
		const {user} = data;
		if(operation === 'removeUserFromRole') {
			if(role._id === 'dev') {
				const devCount = await db.UserModel.count({certs: 'dev'});
				if(devCount <= 1) ctx.throw(400, `角色<${role.displayName}>至少包含一位用户`);
			}
			const {uid} = body;
			const targetUser = await db.UserModel.findOnly({uid});
			if(targetUser.uid === user.uid) {
				ctx.throw(400, '不能移除自己');
			}
			await targetUser.update({$pull: {certs: role._id}});
		}
		await next();
	});
module.exports = usersRouter;