const Router = require('koa-router');
const baseRouter = new Router();
baseRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body, data} = ctx;
		const {role} = data;
		let {displayName, abbr, color, description, modifyPostTimeLimit} = body;
		if(!displayName) ctx.throw(400, '角色名称不能为空');
		modifyPostTimeLimit = parseFloat(modifyPostTimeLimit);
		if(modifyPostTimeLimit < 0 && modifyPostTimeLimit !== -1) modifyPostTimeLimit = 0;
		displayName = displayName.trim();
		const sameDisplayNameRole = await db.RoleModel.findOne({displayName});
		if(sameDisplayNameRole && sameDisplayNameRole._id !== role._id) ctx.throw(400, '角色名称已存在');
		await role.update({displayName, abbr, color, description, modifyPostTimeLimit});
		await next();
	});
module.exports = baseRouter;