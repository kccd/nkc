'use strict';
const subscribeRouter = require('./subscribe');
const settingsRouter = require('./settings');
const homeRouter = require('./home');
const latestRouter = require('./latest');
const followerRouter = require('./follower');
const visitorRouter = require('./visitor');
const libraryRouter = require("./library");
const cardRouter = require("./card");
const Router = require('koa-router');
const path = require('path');
const router = new Router();
router
  /*.get('/', async (ctx) => {
		const {data, params, db} = ctx;
		const {user} = data;
		const {fid} = params;
		const forum = await db.ForumModel.findOnly({fid});
		if(ctx.query.token) {
			if(user) {
				const behavior = await db.UsersBehaviorModel.findOne({fid, uid: user.uid});
				if(behavior) {
					return ctx.redirect(`/f/${forum.fid}/latest?token=${ctx.query.token}`);
				} else {
					return ctx.redirect(`/f/${forum.fid}/home?token=${ctx.query.token}`);
				}
			} else {
				return ctx.redirect(`/f/${forum.fid}/home?token=${ctx.query.token}`);
			}
		}else{
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
		}
	})*/
	.post('/', async (ctx, next) => {
		const {data, params, db, address: ip, fs, query, nkcModules, state} = ctx;
		const {ForumModel, ThreadModel, SubscribeModel} = db;
		const {fid} = params;
	  const {user} = data;
    const body = JSON.parse(ctx.body.fields.body);
    const {post} = body;
    const files = ctx.body.files;
    try{
      await db.UserModel.checkUserBaseInfo(user, true);
    } catch(err) {
      ctx.throw(403, `因为缺少必要的账户信息，无法完成该操作。具体信息：${err.message}`);
    }
		const {c, t, fids, cids, cat, mid, columnCategoriesId = [], anonymous = false, survey} = post;
    nkcModules.checkData.checkString(t, {
      name: "标题",
      minLength: 6,
      maxLength: 200
    });
    nkcModules.checkData.checkString(c, {
      name: "内容",
      minLength: 6,
      maxLength: 100000
    });
		if(fids.length === 0) ctx.throw(400, "请至少选择一个专业");
		if(fids.length  > 2) ctx.throw(400, "最多只能选择两个专业");
    data.forum = await ForumModel.findOnly({fid});
		let options = post;
		options.uid = user.uid;
		options.title = post.t;
		options.content = post.c;
		options.type = "article";
		options.ip = ip;
		if(anonymous && !await db.UserModel.havePermissionToSendAnonymousPost("postToForum", user.uid, fids)) {
      ctx.throw(400, "您没有权限或已选专业不允许发表匿名文章");
    }
    let surveyDB;
    if(survey) {
      const havePermission = await db.SurveyModel.ensureCreatePermission("postToForum", user.uid);
      if(!havePermission) ctx.throw(403, "你没有权限发起调查，请刷新");
      survey.uid = data.user.uid;
      survey.postType = "thread";
      surveyDB = await db.SurveyModel.createSurvey(survey, true);
      options.surveyId = surveyDB._id;
    }
		const _post = await db.ThreadModel.postNewThread(options);
    if(surveyDB) await surveyDB.update({pid: _post.pid});

		// 根据thread生成封面图
    const thread = await db.ThreadModel.findOne({tid: _post.tid});
    if(files.postCover) {
      await nkcModules.file.savePostCover(_post.pid, files.postCover);
    } else if(!_post.cover) {
      await nkcModules.file.createPostCoverByPostId(_post.pid);
    }

    // 转发到专栏
    if(columnCategoriesId.length > 0 && state.userColumn) {
      await db.ColumnPostModel.addColumnPosts(state.userColumn, columnCategoriesId, [_post.pid]);
    }

    // 发表匿名内容
    await db.PostModel.updateOne({pid: thread.oc}, {$set: {anonymous: !!anonymous}});

		// 发帖数加一并生成记录
		const obj = {
			user: data.user,
			type: 'score',
			key: 'threadCount',
			typeIdOfScoreChange: 'postToForum',
			tid: thread.tid,
			pid: thread.oc,
			ip: ctx.address,
			port: ctx.port
		};
		await db.UsersScoreLogModel.insertLog(obj);
		obj.type = 'kcb';
		ctx.state._scoreOperationForumsId = thread.mainForumsId;
		await db.KcbsRecordModel.insertSystemRecord('postToForum', data.user, ctx);
		await thread.updateThreadMessage();

		// 发表文章后进行跳转
		const type = ctx.request.accepts('json', 'html');
    if(type === 'html') {
      ctx.status = 303;
      return ctx.redirect(`/t/${_post.tid}`);
		}

		data.redirect = await db.PostModel.getUrl(_post.pid, true);

		// data.redirect = `/t/${_post.tid}?&pid=${_post.pid}`;

    await next();
  })
  .del('/', async (ctx, next) => {
    const {params, db} = ctx;
    const {fid} = params;
    const {ThreadModel, ForumModel} = db;
    const forum = await ForumModel.findOnly({fid});
    const allChildrenFid = await db.ForumModel.getAllChildrenForums(forum.fid);
		if(allChildrenFid.length !== 0) {
			ctx.throw(400, `该专业下仍有${allChildrenFid.length}个专业, 请转移后再删除该专业`);
		}
    const count = await ThreadModel.count({$or: [
      {
        mainForumsId: fid
      },
      {
        minorForumsId: fid
      }
    ]});
    if(count > 0) {
      ctx.throw(422, `该板块下仍有${count}个文章, 请转移后再删除板块`);
      return next()
    } else {
      await forum.remove()
		}
    return next()
  })
	.use('/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
	.use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
	// .use(['/home', '/latest', '/followers', '/visitors', "/library"], async (ctx, next) => {
	.use("/", async (ctx, next) => {
		const {data, db, params, query, url, method} = ctx;
		let _url = url.replace(/\?.*/g, "");
		_url = _url.replace(/^\/f\/[0-9]+?\/(.+)/i, "$1");
		const {fid} = params;
		if(
			!(
				(_url === `/f/${fid}` && method === "GET") ||
				(_url === "home" && method === "GET") ||
				(_url === "followers" && method === "GET") ||
				(_url === "visitors" && method === "GET") ||
				(_url === "library" && ["GET", "POST"].includes(method))
			)
		) {
			return await next();
		}

		const {token} = query;

		const forum = await db.ForumModel.findOnly({fid});

		// 专业权限判断: 若不是该专业的专家，走正常的权限判断
		if(!token){
			await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
		}else{
			let share = await db.ShareModel.findOne({"token":token});
			if(!share) ctx.throw(403, "无效的token");
			// if(share.tokenLife === "invalid") ctx.throw(403, "链接已失效");
			if(share.tokenLife === "invalid"){
				await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
			}
			let shareLimitTime;
			let allShareLimit = await db.ShareLimitModel.findOne({"shareType":"all"});
			if(forum.shareLimitTime){
				shareLimitTime = forum.shareLimitTime;
			}else{
				shareLimitTime = allShareLimit.shareLimitTime;
			}
			let shareTimeStamp = parseInt(new Date(share.toc).getTime());
			let nowTimeStamp = parseInt(new Date().getTime());
			if(nowTimeStamp - shareTimeStamp > 1000*60*60*shareLimitTime){
				await db.ShareModel.update({"token": token}, {$set: {tokenLife: "invalid"}});
				await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
			}
			// if(share.shareUrl.indexOf(ctx.path) === -1) ctx.throw(403, "无效的token")
		}
		// await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
    data.isModerator = (await forum.isModerator(data.user)) || ctx.permission('superModerator');
		data.forum = forum;

		const {today} = ctx.nkcModules.apiFunction;
		// 能看到入口的专业id
		const fidArr = await db.ForumModel.visibleFid(data.userRoles, data.userGrade, data.user, forum.fid);
		// 拿到能访问的专业id
		const accessibleFid = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, data.user, forum.fid);
		accessibleFid.push(fid);
		// 加载能看到入口的下一级专业
    await forum.extendChildrenForums({fid: {$in: fidArr}});
    // 加载相关专业
    await forum.extendRelatedForums(fidArr);
		fidArr.push(fid);
		// 拿到当前专业所有下属专业的ID
    const childForumsId = await db.ForumModel.getAllChildrenFid(forum.fid);
    childForumsId.push(forum.fid);
		// 拿到今天所有该专业下的用户浏览记录
		const behaviors = await db.UsersBehaviorModel.find({
			timeStamp: {$gt: today()},
			fid: {$in: childForumsId},
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
					data.users.push(targetUser); // 今日来访的用户
				}
			} else {
				break;
			}
    }
    data.users = await db.UserModel.extendUsersInfo(data.users);

		// 获取最新关注的用户
		const subUsers = await db.SubscribeModel.find({
      type: "forum",
      fid: forum.fid
    }).sort({toc: -1}).limit(9);

		data.subUsers = await db.UserModel.find({
      uid: {
        $in: subUsers.map(s => s.uid)
      }
    });

		data.subUsers = await db.UserModel.extendUsersInfo(data.subUsers);

    await forum.extendParentForums();
		// 加载网站公告
		await forum.extendNoticeThreads();


		//版主
		data.moderators = [];
		if (forum.moderators.length > 0) {
      data.moderators = await db.UserModel.find({uid: {$in: forum.moderators}});
    }
    await db.UserModel.extendUsersInfo(data.moderators);

    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user
    );

    // 加载优秀的文章
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);

    // 获取用户关注的专业
    if(data.user) {
      data.subForums = await db.ForumModel.getUserSubForums(data.user.uid, fidOfCanGetThreads);
    }


    // 最新文章
    const latestFid = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user, forum.fid);
    latestFid.push(forum.fid);
    data.latestThreads = await db.ThreadModel.getLatestThreads(fidOfCanGetThreads.filter(fid => !latestFid.includes(fid)));

		 // 加载同级的专业
    const parentForums = await forum.extendParentForums();
    let parentForum;
    if(parentForums.length !== 0) parentForum = parentForums[0];
		if(parentForum) {
			// 拿到parentForum专业下能看到入口的专业id
			const visibleFidArr = await db.ForumModel.visibleFid(data.userRoles, data.userGrade, data.user, parentForum.fid);
			// 拿到parentForum专业下一级能看到入口的专业
			data.sameLevelForums = await parentForum.extendChildrenForums({fid: {$in: visibleFidArr}});
		} else {
			// 拿到能看到入口的所有专业id
			let visibleFidArr = await db.ForumModel.visibleFid(data.userRoles, data.userGrade, data.user);
      visibleFidArr = visibleFidArr.filter(f => f !== forum.fid);
			// 拿到能看到入口的顶级专业
			data.sameLevelForums = await db.ForumModel.find({parentsId: [], fid: {$in: visibleFidArr}});
		}

		data.subUsersCount = await db.SubscribeModel.count({fid, type: "forum"});
		if(data.user) {
      const sub = await db.SubscribeModel.count({
        uid: data.user.uid,
        type: "forum",
        fid
      });
      data.subscribed = !!sub;

      // 用户发表的文章
      data.userThreads = await db.ThreadModel.getUserThreads(data.user.uid, fidOfCanGetThreads);

      // 关注的文章
      // data.subThreads = await db.ThreadModel.getUserSubThreads(data.user.uid, fidOfCanGetThreads);

    }

		// 推荐的文章
    data.recommendThreads = await db.ThreadModel.getRecommendThreads(fidOfCanGetThreads);

		// 加载专业地图
    data.forums = await db.ForumModel.getForumsTree(data.userRoles, data.userGrade, data.user);
    // 加载文章分类
    data.threadTypes = await db.ThreadTypeModel.find({fid: forum.fid}).sort({order: 1});
    data.threadTypesId = data.threadTypes.map(threadType => threadType.cid);

    // 记录专业访问记录
		if(data.user) {
			const {visitedForumsId = []} = data.user.generalSettings;
			const index = visitedForumsId.indexOf(fid);
			if(index !== -1) {
				visitedForumsId.splice(index, 1);
			}
			visitedForumsId.unshift(fid);
			await db.UsersGeneralModel.updateOne({uid: data.user.uid}, {
				$set: {
					"visitedForumsId": visitedForumsId
				}
			});
			// 最近访问的专业
			data.visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId.slice(0, 10));
		}

		ctx.template = 'forum/forum.pug';
		await next();
  })
	.get('/', async (ctx, next) => {
		const {data, db, query, state} = ctx;
		const {pageSettings} = state;
		const {forum} = data;
		let {page = 0, s, cat, d} = query;
		page = parseInt(page);

		// 满足以下条件，跳转到专业首页
		// 1. 用户已登录
		// 2. 访问最新文章列表第一页
		// 3. 填写了专业说明
		// 4. 用户未访问过此专业
		if(data.user && page === 0 && forum.declare) {
			const behavior = await db.UsersBehaviorModel.findOne({fid: forum.fid, uid: data.user.uid});
			let url;
			if(!behavior) {
				url = `/f/${forum.fid}/home`;
				const {token} = ctx.query;
				if(token) {
					url += `?token=${token}`;
				}
				return ctx.redirect(url);
			}
		}

		// 构建查询条件
		const match = {};
		// 获取加精文章
		if(d) {
			match.digest = true;
			data.d = d;
		}
		// 加载某个类别的文章
		if(cat) {
			match.categoriesId = parseInt(cat);
			data.cat = match.categoriesId;
		}
		// 拿到该专业下可从中拿文章的所有子专业id
		let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user, forum.fid);
		fidOfCanGetThreads.push(forum.fid);

		// 构建置顶文章查询条件
		const toppedThreadMatch = {
			topped: true,
			reviewed: true,
			mainForumsId: forum.fid,
			disabled: false
		};
		if(forum.fid === "recycle") {
			delete toppedThreadMatch.disabled;
		}
		// 加载、拓展置顶文章
		const toppedThreads = await db.ThreadModel.find(toppedThreadMatch).sort({tlm: -1});

		data.toppedThreads = await db.ThreadModel.extendThreads(toppedThreads, {
			htmlToText: true
		});
		if(forum.fid === "recycle") {
			data.toppedThreads.map(t => t.disabled = false);
		}

		const topThreadsId = toppedThreads.map(t => t.tid);

		match.mainForumsId = {$in: fidOfCanGetThreads};
		match.tid = {$nin: topThreadsId};
		if(forum.fid !== "recycle") {
			match.disabled = false;
		}
		if(data.user) {
			if(!ctx.permission("superModerator")) {
				const canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
				match.$or = [
					{
						reviewed: true
					},
					{
						reviewed: false,
						uid: data.user.uid
					},
					{
						reviewed: false,
						mainForumsId: {$in: canManageFid}
					}
				]
			}
		} else {
			match.reviewed = true;
		}
		const count = await db.ThreadModel.count(match);
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count, pageSettings.forumThreadList);
		data.paging = paging;
		const limit = paging.perpage;
		const skip = paging.start;
		let sort;
		if(s === "toc") {
			sort = {toc: -1};
		} else {
			sort = {tlm: -1};
		}
		data.s = s;
		let threads = await db.ThreadModel.find(match).sort(sort).skip(skip).limit(limit);

		threads = await db.ThreadModel.extendThreads(threads, {
			category: true,
			htmlToText: true
		});


		const superModerator = ctx.permission("superModerator");
		let canManageFid = [];
		if(data.user) {
			canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
		}
		data.threads = [];
		for(const thread of threads) {
			if(forum.fid === "recycle") {
				// 为了在访问回收站时隐藏"已屏蔽，仅自己可见";
				thread.disabled = false;
			}
			if (thread.recycleMark) {
				// 根据权限过滤掉 屏蔽、退修的内容
				if (data.user) {
					// 不具有特殊权限且不是自己
					if (!superModerator) {
						const mainForumsId = thread.mainForumsId;
						let has = false;
						for (const fid of mainForumsId) {
							if (canManageFid.includes(fid)) {
								has = true;
							}
						}
						if (!has) continue;
					}
				} else {
					continue;
				}
			}
			data.threads.push(thread);
		}

		data.type = 'latest';
		data.isFollow = data.user && data.forum.followersId.includes(data.user.uid);
		await next();
	})
  .use("/card", cardRouter.routes(), cardRouter.allowedMethods())
	.use('/visitors', visitorRouter.routes(), visitorRouter.allowedMethods())
	.use("/latest", latestRouter.routes(), latestRouter.allowedMethods())
	.use('/followers', followerRouter.routes(), followerRouter.allowedMethods())
	.use('/home', homeRouter.routes(), homeRouter.allowedMethods())
  .use("/library", libraryRouter.routes(), libraryRouter.allowedMethods());
module.exports = router;


