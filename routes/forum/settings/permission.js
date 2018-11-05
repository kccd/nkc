const Router = require('koa-router');
const permissionRouter = new Router();
permissionRouter
	.get('/', async (ctx, next) => {
		const {data, allContentClasses, db} = ctx;
		data.allContentClasses = allContentClasses;
		data.roles = await db.RoleModel.find().sort({toc: 1});
		data.grades = await db.UsersGradeModel.find().sort({score: 1});
		ctx.template = 'interface_forum_settings_permission.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, body, db, redis} = ctx;
		const {forum} = data;
		const {klass, accessible, displayOnParent, visibility, isVisibleForNCC, gradesId, rolesId, relation} = body;
		const rolesDB = await db.RoleModel.find();
		const rolesIdDB = rolesDB.map(r => r._id);
		const gradesDB = await db.UsersGradeModel.find();
		const gradesIdDB = gradesDB.map(g => g._id);
		const gradesId_ = []; rolesId_ = [];
		for(const roleId of rolesId) {
			if(rolesIdDB.includes(roleId)) {
				rolesId_.push(roleId);
			}
		}
		for(let gradeId of gradesId) {
			gradeId = parseInt(gradeId);
			if(gradesIdDB.includes(gradeId)) {
				gradesId_.push(gradeId);
			}
		}
		if(!['and', 'or'].includes(relation)) ctx.throw(400, '用户角色与用户等级关系设置错误，请刷新页面重试');
		await forum.update({class: klass, accessible, displayOnParent, visibility, isVisibleForNCC, gradesId: gradesId_, rolesId: rolesId_, relation});
		await redis.cacheForums();
		await next();
	});
module.exports = permissionRouter;