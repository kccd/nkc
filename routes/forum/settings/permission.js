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
      shareLimitStatus, shareLimitCount, shareLimitTime, allowedAnonymousPost,
      moderators, subType, openReduceVisits, permission, orderBy,
      voteUpPost
    } = body.forum;
    const oldModerators = forum.moderators;
    const {read, write, writePost} = permission;
    shareLimitCount = Number(shareLimitCount);
    shareLimitTime = Number(shareLimitTime);
    if(!['inherit', 'off', 'on'].includes(shareLimitStatus)) {
      ctx.throw(400, `分享文章、回复或评论状态设置错误`);
    }
    checkNumber(shareLimitCount, {
      name: '分享链接访问次数限制',
      min: 1
    });
    checkNumber(shareLimitTime, {
      name: '分享链接有效时间',
      fractionDigits: 2,
      min: 0.01
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
    if(!['hide', 'show', 'inherit'].includes(voteUpPost.status)) {
      ctx.throw(400, `高赞列表 - 状态 设置错误`);
    }
    checkNumber(voteUpPost.voteUpCount, {
      name: '高赞列表 - 最小点赞数',
      min: 1
    });
    checkNumber(voteUpPost.postCount, {
      name: '高赞列表 - 高赞回复数',
      min: 1
    });
    checkNumber(voteUpPost.selectedPostCount, {
      name: '高赞列表 - 选取高赞回复数',
      min: 1
    });
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
        shareLimitStatus,
        subType,
        permission,
        voteUpPost: {
          status: voteUpPost.status,
          voteUpCount: voteUpPost.voteUpCount,
          postCount: voteUpPost.postCount,
          selectedPostCount: voteUpPost.selectedPostCount
        }
      }
    });
    const oldUserId = oldModerators.filter(uid => !moderators.includes(uid));
    const newUserId = moderators.filter(uid => !oldModerators.includes(uid));
    await db.UserModel.updateMany({uid: {$in: oldUserId}}, {
      $pull: {
        certs: 'moderator'
      }
    });
    await db.UserModel.updateMany({uid: {$in: newUserId}}, {
      $addToSet: {
        certs: 'moderator'
      }
    });
    await redis.cacheForums();
    await db.ForumModel.saveForumToRedis(forum.fid);
    await next();
  });
module.exports = permissionRouter;
