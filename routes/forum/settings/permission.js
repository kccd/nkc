const Router = require('koa-router');
const permissionRouter = new Router();
permissionRouter
	.get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {forum} = data;
    data.roles = await db.RoleModel.find().sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({score: 1});
    if(ctx.permission("createForumLibrary")) {
      if(data.forum.lid) {
        const library = await db.LibraryModel.findOne({_id: data.forum.lid});
        if(!library) {
          data.forum.lid = "";
        } else {
          data.libraryClosed = library.closed;
        }
      }
    }
    ctx.template = 'forum/settings/permission.pug';
    data.moderators = await db.UserModel.find({uid: {$in: forum.moderators}});
    // ctx.template = 'interface_forum_settings_permission.pug'
		await next();
	})
  .put(`/`, async (ctx, next) => {
    const {data, body, db, redis, nkcModules} = ctx;
    const {checkNumber} = nkcModules.checkData;
    const {forum} = data;
    let {
      accessible, displayOnParent, visibility, isVisibleForNCC,
      displayOnSearch, threadListStyle,
      shareLimitCount, shareLimitTime, allowedAnonymousPost,
      moderators, subType, openReduceVisits, permission, orderBy
    } = body.forum;
    const oldModerators = forum.moderators;
    const {read, write, writePost} = permission;
    shareLimitCount = Number(shareLimitCount);
    shareLimitTime = Number(shareLimitTime);
    checkNumber(shareLimitCount, {
      name: '分享链接访问次数限制',
      min: 0
    });
    checkNumber(shareLimitTime, {
      name: '分享链接有效时间',
      fractionDigits: 2,
      min: 0
    });
    for(const uid of moderators) {
      const u = await db.UserModel.findOne({uid});
      if(!u) ctx.throw(400, `主管专家ID错误 uid: ${uid}`);
    }
    if(!["free", "force", "unSub"].includes(subType)) ctx.throw(400, "请选择关注类型");
    if(!['tlm', 'toc'].includes(orderBy)) ctx.throw(400, '请选择文章排序方式');
    const rolesId = await db.RoleModel.getRolesId();
    const grades = await db.UsersGradeModel.find();
    const gradesId = grades.map(g => g._id);
    read.rolesId = read.rolesId.filter(r => rolesId.includes(r));
    read.gradesId = read.gradesId.filter(g => gradesId.includes(g));
    write.rolesId = write.rolesId.filter(r => rolesId.includes(r));
    write.gradesId = write.gradesId.filter(g => gradesId.includes(g));
    writePost.rolesId = writePost.rolesId.filter(r => rolesId.includes(r));
    writePost.gradesId = writePost.gradesId.filter(g => gradesId.includes(g));
    const relations = [`and`, 'or'];
    if(!relations.includes(read.relation) || !relations.includes(write.relation) || !relations.includes(writePost.relation)) {
      ctx.throw(400, '请选择证书等级关系');
    }
    if(!['abstract', 'brief', 'minimalist'].includes(threadListStyle.type)) ctx.throw(400, `文章列表显示模式设置错误 type: ${threadListStyle.type}`);
    if(!['left', 'right', 'null'].includes(threadListStyle.cover)) ctx.throw(400, `文章列表封面图设置错误 cover: ${threadListStyle.cover}`);
    await db.ForumModel.updateOne({fid: forum.fid}, {
      $set: {
        accessible: !!accessible,
        displayOnParent: !!displayOnParent,
        visibility: !!visibility,
        isVisibleForNCC: !!isVisibleForNCC,
        allowedAnonymousPost: !!allowedAnonymousPost,
        openReduceVisits: !!openReduceVisits,
        displayOnSearch: !!displayOnSearch,
        threadListStyle,
        moderators,
        shareLimitTime,
        orderBy,
        shareLimitCount,
        subType, permission
      }
    });
    await redis.cacheForums();
    await db.ForumModel.saveForumToRedis(forum.fid);
    await next();
  })
  /*
	.put('/', async (ctx, next) => {
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
      subType,
      openReduceVisits,      // 是否开启流控
      permission
		} = body;
		const {read, write} = permission;
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
        allowedAnonymousPost: !!allowedAnonymousPost,
        openReduceVisits
		  }
		);
		await redis.cacheForums();
		await next();
	});
   */
module.exports = permissionRouter;
