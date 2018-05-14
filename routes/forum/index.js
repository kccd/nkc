const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
const subscribeRouter = require('./subscribe');
const settingsRouter = require('./settings');
const homeRouter = require('./home');
const latestRouter = require('./latest');
const followerRouter = require('./follower');
const visitorRouter = require('./visitor');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		const forums = await db.ForumModel.getVisibleForums(ctx);
		data.forums = dbFn.forumsListSort(forums, threadTypes);
    ctx.template = 'interface_forums.pug';
    data.uid = user? user.uid: undefined;
    data.navbar = {highlight: 'forums'};
    await next();
  })
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {displayName} = body;
		if(data.userLevel < 6) ctx.throw(403, '权限不足');
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
		/*const {data, body, db} = ctx;
		const {ForumModel, UserModel, SettingModel} = db;
		const {userLevel} = data;
		const {
		  type,
      description,
      displayName,
      visibility,
      parentId,
      order,
      moderators,
      isVisibleForNCC,
      color,
      contentClass,
      abbr,
		} = body;
    if(userLevel < 6) {
      ctx.throw(403, '权限不足');
      return next()
    }
    const isDisplayNameExists = await ForumModel.findOne({displayName});
    if(isDisplayNameExists) {
      ctx.throw(422, `全名为 [${displayName}] 的板块已存在`);
      return next()
    }
		switch(type) {
      case 'category':
        body.parentId = undefined;
        break;
      case 'forum':
        if(parentId && await ForumModel.findOne({fid: parentId}))
          break;
        else {
          ctx.throw(422, `父分区 [${parentId}] 不存在或未指定`);
          return next()
        }
      default:
        ctx.throw(422, `未知分区类型 [${type}] `);
        return next()
    }
    body.class = contentClass;
		const usernames = moderators.split(',').map(name => name.toLowerCase());
    try {
      body.moderators = await Promise.all(usernames.map(async name =>
        await UserModel.findOnly({usernameLowerCase: name})
          .then(user => user.uid)
      ));
    } catch(e) {
      ctx.throw(422, '管理员中有不存在的用户名');
      return next()
    }
    body.fid = await SettingModel.operateSystemID('forums', 1);
    const newForum = new ForumModel(body);
		await newForum.save();
    return ctx.redirect(`/f/${body.fid}`, 303)*/
	})
	.get('/:fid', async (ctx, next) => {
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
		/*const {ForumModel, ThreadTypeModel, UserModel, UsersSubscribeModel} = ctx.db;
		const {fid} = ctx.params;
		const {data, query, generateUsersBehavior} = ctx;
		const {digest, cat, sortby} = query;
		const page = query.page || 0;
		const forum = await ForumModel.findOnly({fid});
		await forum.ensurePermission(ctx);
		const q = {};
		q.match = {};
		if(cat) {
			q.match.cid = parseInt(cat);
			data.cat = q.match.cid;
		}
		if(digest) {
			q.match.digest = true;
			data.digest = true;
		}

		if(data.userLevel < 4 || (data.userLevel === 4 && !forum.moderators.includes(data.user.uid))) {
			q.disabled = false;
		}

		const countOfThread = await forum.getThreadsCountByQuery(ctx, q);
		const paging = apiFn.paging(page, countOfThread);
		data.sortby = sortby;
		data.paging = paging;
		data.forum = forum;

		// 加载版主
		data.moderators = [];
		if (forum.moderators.length > 0) {
			data.moderators = await UserModel.find({uid: {$in: forum.moderators}});
		}

		q.limit = paging.perpage;
		q.skip = paging.start;
		if(sortby === 'toc') {
			q.sort = {toc: -1};
		} else {
			q.sort = {tlm: -1};
		}

		data.threads = await forum.getThreadsByQuery(ctx, q);
		data.toppedThreads = await forum.getToppedThreads(ctx);

		data.threadTypes = await ThreadTypeModel.find({fid}).sort({order: 1});

 		if (data.user) {
			data.userThreads = await data.user.getUsersThreads();
			data.userSubscribe = await UsersSubscribeModel.findOnly({uid: data.user.uid});
		}
		// 加载能看到入口的板块
		const visibleFid = await ForumModel.getVisibleFid(ctx, '');

		// 加载路径导航，子版块
		const breadcrumbForums = await forum.getBreadcrumbForums();
		const childrenForums = await forum.extendChildrenForums({
			fid: {
				$in: visibleFid
			}
		});
		await Promise.all(childrenForums.map(forum => forum.extendChildrenForums()));
		data.childrenForums = childrenForums;

		// 若路径导航存在不能访问且不可见的板块则抛出权限不足
		breadcrumbForums.map(forum => {
			if(!visibleFid.includes(forum.fid)) {
				ctx.throw(403, '权限不足');
			}
		});

		data.forumList = await ForumModel.find({});
		data.forumsThreadTypes = await ThreadTypeModel.find({}).sort({order: 1});
		data.breadcrumbForums = breadcrumbForums;
		if(data.user) {
			await generateUsersBehavior({
				operation: 'viewForum',
				fid: forum.fid,
				type: forum.class
			});
		}
		ctx.template = 'interface_forum.pug';
		await next();*/
	})
	.post('/:fid', async (ctx, next) => {
		const {
			data, params, db, body, address: ip, query,
      generateUsersBehavior
    } = ctx;
		const {
			ForumModel,
			ThreadModel
		} = db;
		const {fid} = params;
		const forum = await ForumModel.findOnly({fid});
	  const {user} = data;
	  await forum.ensurePermission(ctx);
	  const childrenForums = await forum.extendChildrenForums();
	  if(childrenForums.length !== 0) {
	  	ctx.throw(400, '该专业存下存在其他专业，请到下属专业发表文章。');
	  }
		if(!user.certs.includes('mobile')) ctx.throw(403,'您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
		if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发帖。');
	  const {post} = body;
    const {c, t} = post;
    if(c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
    if(t === '') ctx.throw(400, '标题不能为空！');
    const {cat, mid} = post;
    const _post = await forum.newPost(post, user, ip, cat, mid);
    await generateUsersBehavior({
      operation: 'postToForum',
      pid: _post.pid,
      tid: _post.tid,
      fid: forum.fid,
      mid: user.uid,
	    type: forum.class,
      toMid: user.uid,
    });
    const type = ctx.request.accepts('json', 'html');
    await forum.update({$inc: {'tCount.normal': 1}});
    const thread = await ThreadModel.findOnly({tid: _post.tid});
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
		const {data, db, params, generateUsersBehavior} = ctx;
		const {fid} = params;
		const forum = await db.ForumModel.findOnly({fid});
		await forum.ensurePermission(ctx);
		data.forum = forum;

		// 添加访问记录
		if(data.user) {
			await generateUsersBehavior({
				operation: 'viewForum',
				fid: forum.fid,
				type: forum.class
			});
		}


		const {today} = ctx.nkcModules.apiFunction;
		const fidArr = await db.ForumModel.getVisibleFid(ctx, fid);
		const accessibleFid = await db.ForumModel.getAccessibleFid(ctx, fid);
		accessibleFid.push(fid);
		await forum.extendChildrenForums({fid: {$in: fidArr}});
		fidArr.push(fid);
		const behaviors = await db.UsersBehaviorModel.find({
			timeStamp: {$gt: today()},
			fid: {$in: fidArr},
			operation: 'viewForum'
		}).sort({timeStamp: -1});
		const usersId = [];
		behaviors.map(b => {
			if(!usersId.includes(b.uid)) {
				usersId.push(b.uid);
			}
		});
		data.users = [];
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
		await forum.extendNoticeThreads();
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
		data.digestThreads = await Promise.all(digestThreads.map(async thread => {
			const post = await db.PostModel.findOnly({pid: thread.oc});
			const forum = await db.ForumModel.findOnly({fid: thread.fid});
			await post.extendUser();
			thread.firstPost = post;
			thread.forum = forum;
			return thread;
		}));

		ctx.template = 'interface_forum_home.pug';
		await next();
	})
	.use('/:fid/latest', latestRouter.routes(), latestRouter.allowedMethods())
	.use('/:fid/visitors', visitorRouter.routes(), visitorRouter.allowedMethods())
	.use('/:fid/followers', followerRouter.routes(), followerRouter.allowedMethods())
	.use('/:fid/home', homeRouter.routes(), homeRouter.allowedMethods());
module.exports = forumRouter;