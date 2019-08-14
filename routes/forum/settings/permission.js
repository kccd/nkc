const Router = require('koa-router');
const permissionRouter = new Router();
permissionRouter
	.get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.roles = await db.RoleModel.find().sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({score: 1});
    // ctx.template = 'forum/settings/permission.pug';
    ctx.template = 'interface_forum_settings_permission.pug'
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, body, db, redis} = ctx;
		const {forum} = data;
		let {
		  klass, accessible,
      displayOnParent, visibility,
      isVisibleForNCC, gradesId,
      rolesId, relation,
      shareLimitCount,
      shareLimitTime,
      allowedAnonymousPost,
      moderators,
      subType
		} = body;
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
    if(!["free", "force", "unSub"].includes(subType)) ctx.throw(400, "请选择关注类型");
    moderators = moderators.split(',');
    const oldModerators = forum.moderators;
    for(let uid of oldModerators) {
      if(!moderators.includes(uid)) {
        // 移除当前专业的专家身份，若在其他专业都不为专家，则移除专家证书
        const forumsCount = await db.ForumModel.count({fid: {$ne: forum.fid}, moderators: uid});
        if(!forumsCount) {
          const user = await db.UserModel.findOnly({uid});
          await user.update({$pull: {certs: 'moderator'}});
        }
      }
    }
    const moderators_ = [];
    await Promise.all(moderators.map(async uid => {
      uid = uid.trim();
      const targetUser = await db.UserModel.findOne({uid});
      if(targetUser) {
        moderators_.push(uid);
        await targetUser.update({$addToSet: {certs: 'moderator'}})
      }
    }));
		await forum.update(
		  {
        class: klass, accessible,
        displayOnParent, visibility,
        isVisibleForNCC, gradesId: gradesId_,
        rolesId: rolesId_,
        relation,
        shareLimitCount,
        shareLimitTime,
        moderators: moderators_,
        subType,
        allowedAnonymousPost: !!allowedAnonymousPost
		  }
		);
		await redis.cacheForums();
		await next();
	});
module.exports = permissionRouter;