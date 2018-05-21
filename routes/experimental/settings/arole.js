const Router = require('koa-router');
const permissionRouter = new Router();
permissionRouter
	.get('/:_id', async (ctx, next) => {

	})
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;
		ctx.localTemplate = 'experimental/settings/role.pug';
		ctx.template = 'experimental/index.pug';
		data.type = 'role';
		let {r, page, t} = query;
		r = r || 'dev';
		t = t || 'users';
		data.role = await db.RoleModel.findOne({_id: r});
		if(!page) {
			page = 0;
		} else {
			page = parseInt(page);
		}
		data.r = r;
		data.t = t;

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
		if(t === 'users') {
			if(r === 'visitor') {
				return ctx.redirect(`/e/settings/role?r=visitor&t=base`);
			}
			let q = {};
			if(r === 'default') {
				q.certs = {$ne: 'banned'};
			} else {
				q.certs = r;
			}
			const count = await db.UserModel.count(q);
			const paging = nkcModules.apiFunction.paging(page, count);
			data.users = await db.UserModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
			data.paging = paging;
		} else if(t === 'permissions') {
			data.operations = await db.OperationModel.find({}).sort({toc: 1});
		}
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body, settings} = ctx;
		const {operation, roleId} = body;
		const role = await db.RoleModel.findOnly({_id: roleId});
		if(operation === 'modifyRoleBase') {
			const {displayName, abbr, color, description} = body;
			if(!displayName) ctx.throw(400, '角色名称不能为空');
			await role.update({displayName, abbr, color, description});
		} else if(operation === 'modifyRolePermissions') {
			const {operationsId} = body;
			const newOperationsId = [];
			const defaultOperationsId = settings.operations.getOperationsId();
			for(let operationId of operationsId) {
				if(defaultOperationsId.includes(operationId) && !newOperationsId.includes(operationId)) {
					newOperationsId.push(operationId);
				}
			}
			await role.update({operationsId: newOperationsId});
		}
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
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
		await next();
	})
	.del('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		await next();
	});
module.exports = permissionRouter;