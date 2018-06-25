const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const settingsRouter = require('./settings');
const homeRouter = require('./home');
const latestRouter = require('./latest');
const followerRouter = require('./follower');
const visitorRouter = require('./visitor');
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    const {user} = data;
    const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
    const gradeId = data.userGrade._id;
    const rolesId = data.userRoles.map(r => r._id);
    const options = {
    	gradeId,
	    rolesId,
	    uid: user?user.uid: ''
    };
		const forums = await db.ForumModel.visibleForums(options);
		data.forums = nkcModules.dbFunction.forumsListSort(forums, threadTypes);
    ctx.template = 'interface_forums.pug';
    data.uid = user? user.uid: undefined;
    data.navbar = {highlight: 'forums'};
    await next();
  })
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {displayName} = body;
		if(!displayName) ctx.throw(400, '板块名称不能为空');
		const sameDisplayNameForum = await db.ForumModel.findOne({displayName});
		if(sameDisplayNameForum) ctx.throw(400, '板块名称已存在');
		let _id;
		while(1) {
			_id = await db.SettingModel.operateSystemID('forums', 1);
			const sameIdForum = await db.ForumModel.findOne({fid: _id});
			if(!sameIdForum) {
				break;
			}
		}
		const newForum = db.ForumModel({
			fid: _id,
			displayName,
			accessible: false,
			visibility: false,
			type: 'forum'
		});
		await newForum.save();
		data.forum = newForum;
		await next();
	})
	.get('/:fid', async (ctx) => {
		const {data, params, db} = ctx;
		const {user} = data;
		const {fid} = params;
		const forum = await db.ForumModel.findOnly({fid});
		if(user) {
			const behavior = await db.UsersBehaviorModel.findOne({fid, uid: user.uid});
			if(behavior) {
				return ctx.redirect(`/f/${forum.fid}/latest`);
			} else {
				return ctx.redirect(`/f/${forum.fid}/home`);
			}
		} else {
			return ctx.redirect(`/f/${forum.fid}/home`);
		}
	})
	.post('/:fid', async (ctx, next) => {
		const {
			data, params, db, body, address: ip, query
    } = ctx;
		const {
			ForumModel,
			ThreadModel
		} = db;
		const {fid} = params;
		const forum = await ForumModel.findOnly({fid});
		data.forum = forum;
	  const {user} = data;
	  const options = {
	  	gradeId: data.userGrade._id,
		  rolesId: data.userRoles.map(r => r._id),
	  	uid: user?user.uid: ''
	  };
	  await forum.ensurePermissionNew(options);
	  const childrenForums = await forum.extendChildrenForums();
	  if(childrenForums.length !== 0) {
	  	ctx.throw(400, '该专业存下存在其他专业，请到下属专业发表文章。');
	  }
		if(user.authLevel < 1) ctx.throw(403,'您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
		if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发帖。');
	  const {post} = body;
    const {c, t} = post;
    if(c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
    if(t === '') ctx.throw(400, '标题不能为空！');
    const {cat, mid} = post;
    const _post = await forum.newPost(post, user, ip, cat, mid);
    const type = ctx.request.accepts('json', 'html');
    await forum.update({$inc: {'tCount.normal': 1}});
    const thread = await ThreadModel.findOnly({tid: _post.tid});
    data.thread = thread;

		// 发帖数加一并生成记录
		const obj = {
			user,
			type: 'score',
			key: 'threadCount',
			typeIdOfScoreChange: 'postToForum',
			tid: thread.tid,
			pid: thread.oc,
			fid,
			ip: ctx.address,
			port: ctx.port
		};
		await db.UsersScoreLogModel.insertLog(obj);
		obj.type = 'kcb';
		await db.UsersScoreLogModel.insertLog(obj);

    await thread.updateThreadMessage();
    if(type === 'html') {
      ctx.status = 303;
      return ctx.redirect(`/t/${_post.tid}`);
    }
    data.redirect = `/t/${_post.tid}?&pid=${_post.pid}`;
    data.post = _post;

    //帖子曾经在草稿箱中，发表时，删除草稿
    await db.DraftModel.remove({"did":post.did})
    await next();
  })
  .del('/:fid', async (ctx, next) => {
    const {params, db} = ctx;
    const {fid} = params;
    const {ThreadModel, ForumModel} = db;
    const forum = await ForumModel.findOnly({fid});
    const allChildrenFid = await db.ForumModel.getAllChildrenForums(forum.fid);
		if(allChildrenFid.length !== 0) {
			ctx.throw(400, `该专业下仍有${allChildrenFid.length}个专业, 请转移后再删除该专业`);
		}
    const count = await ThreadModel.count({fid});
    if(count > 0) {
      ctx.throw(422, `该板块下仍有${count}个帖子, 请转移后再删除板块`);
      return next()
    } else {
      await forum.remove()
    }
    return next()
  })
	.use('/:fid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
	.use('/:fid/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
	.use(['/:fid/home', '/:fid/latest', '/:fid/followers', '/:fid/visitors'], async (ctx, next) => {
		const {data, db, params} = ctx;
		const {fid} = params;

		// 拿到用户等级
		const gradeId = data.userGrade._id;
		// 拿到用户的角色
		const rolesId = data.userRoles.map(r => r._id);

		const forum = await db.ForumModel.findOnly({fid});

		// 专业权限判断: 若不是该专业的专家，走正常的权限判断
		await forum.ensurePermissionNew({gradeId, rolesId, uid: data.user?data.user.uid: ''});
		data.isModerator = await forum.isModerator(data.user?data.user.uid: '');
		data.forum = forum;

		const {today} = ctx.nkcModules.apiFunction;
		// 获取能看到入口的专业id
		const options = {
			gradeId,
			rolesId,
			fid,
			uid: data.user?data.user.uid: ''
		};
		const fidArr = await db.ForumModel.visibleFid(options);
		// 拿到能访问的专业id
		const accessibleFid = await db.ForumModel.accessibleFid(options);
		accessibleFid.push(fid);
		// 加载能看到入口的下一级专业
		await forum.extendChildrenForums({fid: {$in: fidArr}});
		fidArr.push(fid);
		// 拿到今天所有该专业下的用户浏览记录
		const behaviors = await db.UsersBehaviorModel.find({
			timeStamp: {$gt: today()},
			fid: {$in: fidArr},
			operationId: {$in: ['visitForumLatest', 'visitThread', 'visitForumFollowers', 'visitForumVisitors']}
		}).sort({timeStamp: -1});
		const usersId = [];
		// 过滤掉重复的用户
		behaviors.map(b => {
			if(!usersId.includes(b.uid)) {
				usersId.push(b.uid);
			}
		});
		data.users = [];
		data.usersId = usersId;
		data.behaviors = behaviors;
		for(let uid of usersId) {
			if(data.users.length < 9) {
				const targetUser = await db.UserModel.findOne({uid});
				if(targetUser) {
					data.users.push(targetUser);
				}
			} else {
				break;
			}
		}

		await forum.extendParentForum();
		// 加载网站公告
		await forum.extendNoticeThreads();
		// 加载关注专业的用户
		let followersId = forum.followersId;
		followersId = followersId.reverse();
		const followers = [];
		for(let uid of followersId) {
			if(followers.length < 9) {
				const targetUser = await db.UserModel.findOne({uid});
				if(targetUser) {
					followers.push(targetUser);
				}
			} else {
				break;
			}
		}
		forum.followers = followers;

		//版主
		data.moderators = [];
		if (forum.moderators.length > 0) {
			data.moderators = await db.UserModel.find({uid: {$in: forum.moderators}});
		}

		if(data.user) {
			data.userSubscribe = await db.UsersSubscribeModel.findOnly({uid: data.user.uid});
		}

		const digestThreads = await db.ThreadModel.aggregate([
			{
				$match: {
					fid: {$in: accessibleFid},
					digest: true
				}
			},
			{
				$sample: {
					size: 8
				}
			}
		]);
		// 加载优秀的文章
		data.digestThreads = await Promise.all(digestThreads.map(async thread => {
			const post = await db.PostModel.findOnly({pid: thread.oc});
			const forum = await db.ForumModel.findOnly({fid: thread.fid});
			await post.extendUser();
			thread.firstPost = post;
			thread.forum = forum;
			return thread;
		}));
		// 加载同级的专业
		const parentForum = await forum.extendParentForum();
		if(parentForum) {
			options.fid = parentForum.fid;
			// 拿到parentForum专业下能看到入口的专业id
			const visibleFidArr = await db.ForumModel.visibleFid(options);
			// 拿到parentForum专业下一级能看到入口的专业
			data.sameLevelForums = await parentForum.extendChildrenForums({fid: {$in: visibleFidArr}});
		} else {
			delete options.fid;
			// 拿到能看到入口的所有专业id
			const visibleFidArr = await db.ForumModel.visibleFid(options);
			// 拿到能看到入口的顶级专业
			data.sameLevelForums = await db.ForumModel.find({parentId: '', fid: {$in: visibleFidArr}});
		}

		ctx.template = 'interface_forum_home.pug';
		await next();
	})
	.use('/:fid/latest', latestRouter.routes(), latestRouter.allowedMethods())
	.use('/:fid/visitors', visitorRouter.routes(), visitorRouter.allowedMethods())
	.use('/:fid/followers', followerRouter.routes(), followerRouter.allowedMethods())
	.use('/:fid/home', homeRouter.routes(), homeRouter.allowedMethods());
module.exports = forumRouter;