'use strict'
const Router = require('koa-router');
const usersRouter = new Router();
usersRouter
	.get('/', async (ctx, next) => {
		const {data, query} = ctx;
		const {page = 0} = query;
		const {role} = data;
		if(role._id === 'visitor') {
			return ctx.redirect(`/e/settings/role/visitor`);
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
    ctx.template = 'experimental/settings/role/users.pug';
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
				ctx.throw(403, '运维人员不可移除！！！');
			}
			if(role._id === 'moderator') {
				ctx.throw(403, '暂不支持移除版主');
			}
			if(role._id === 'scholar') {
				ctx.throw(403, '无法移除用户，系统会自动根据用户的学术分进行移除');
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