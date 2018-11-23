const Router = require('koa-router');
const baseRouter = require('./base');
const usersRouter = require('./users');
const permissionsRouter = require('./permissions');
const roleRouter = new Router();
roleRouter
	.get('/', async (ctx) => {
		return ctx.redirect('/e/settings/role/dev');
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, redis} = ctx;
		let {displayName, id} = body;
		if(!displayName) ctx.throw(400, '角色名称不能为空');
		if(!id) ctx.throw(400, '角色id不能为空');
		displayName = displayName.trim();
		const sameIdRole = await db.RoleModel.findOne({_id: id});
		if(sameIdRole) ctx.throw(400, '角色Id已存在');
		const sameDisplayNameRole = await db.RoleModel.findOne({displayName});
		if(sameDisplayNameRole) ctx.throw(400, '角色名称已存在');
		id = id.trim();
		const role = db.RoleModel({
			_id: id,
			displayName,
			abbr: displayName.slice(0,1)
		});
		await role.save();
		data.role = role;
    await redis.cacheForums();
		await next();
	})
	.del('/:_id', async (ctx, next) => {
		const {params, db, redis} = ctx;
		const {_id} = params;
		const role = await db.RoleModel.findOnly({_id});
		if(role.defaultRole) ctx.throw(400, '无法删除默认角色');
		await db.UserModel.updateMany({certs: _id}, {$pull: {certs: _id}});
		await role.remove();
    await redis.cacheForums();
		await next();
	})
	.get('/:_id', async (ctx) => {
		const {_id} = ctx.params;
		return ctx.redirect(`/e/settings/role/${_id}/users`);
	})
	.use(['/:_id/base', '/:_id/users', '/:_id/permissions'], async (ctx, next) => {
		const {params, db, data} = ctx;
		const {_id} = params;
		data.role = await db.RoleModel.findOnly({_id});
		const urlArr = ctx.url.replace(/\?.*/, '').split('/');
		data.type = 'role';
		data.t = urlArr[urlArr.length -1];
		const defaultRoles = await db.RoleModel.find({defaultRole: true}).sort({toc: 1});
		const roles = await db.RoleModel.find({defaultRole: false}).sort({toc: 1});
		data.roles = await Promise.all(roles.map(async role => {
			await role.extendUserCount();
			return role;
		}));
		data.defaultRoles = await Promise.all(defaultRoles.map(async role => {
			await role.extendUserCount();
			return role;
		}));
		ctx.template = 'experimental/settings/role.pug';
		await next();
	})
	.use('/:_id/base', baseRouter.routes(), baseRouter.allowedMethods())
	.use('/:_id/users', usersRouter.routes(), usersRouter.allowedMethods())
	.use('/:_id/permissions', permissionsRouter.routes(), permissionsRouter.allowedMethods());

module.exports = roleRouter;