'use strict';
const subscribeRouter = require('./subscribe');
const settingsRouter = require('./settings');
const homeRouter = require('./home');
const latestRouter = require('./latest');
const followerRouter = require('./follower');
const bannerRouter = require('./banner');
const visitorRouter = require('./visitor');
const Router = require('koa-router');
const path = require('path');
const router = new Router();
router
  .get('/', async (ctx) => {
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
	.post('/', async (ctx, next) => {
		const {
			data, params, db, body, address: ip, fs, query, nkcModules
    } = ctx;
		const {
			ForumModel,
			ThreadModel,
			UsersSubscribeModel,
		} = db;
		const {fid} = params;
		const forum = await ForumModel.findOnly({fid});
		data.forum = forum;
	  const {user} = data;
    if(!await db.UserModel.checkUserBaseInfo(user)) {
      ctx.throw(400, `因为缺少必要的账户信息，无法完成该操作。包括下面一项或者几项：未设置用户名，未设置头像，未绑定手机号。`);
    }
    // if(!user.username) ctx.throw(403, '您的账号还未完善资料，请前往资料设置页完善必要资料。');
    const forums = await db.ForumModel.find({fid: {$in: body.post.fids}});
    forums.push(forum);
    for(const f of forums) {
      await f.ensurePermission(data.userRoles, data.userGrade, data.user);
    }
	  const childrenForums = await forum.extendChildrenForums();
	  if(childrenForums.length !== 0) {
	  	ctx.throw(400, '该专业下存在其他专业，请到下属专业发表文章。');
	  }

	  // 根据发表设置，判断用户是否有权限发表文章
    // 1. 身份认证等级
    // 2. 考试
    // 3. 角色
    // 4. 等级
	  const postSettings = await db.SettingModel.findOnly({_id: 'post'});
	  const {authLevelMin, exam} = postSettings.c.postToForum;
	  const {volumeA, volumeB, notPass} = exam;
	  const {status, countLimit, unlimited} = notPass;
	  const today = nkcModules.apiFunction.today();
    const todayThreadCount = await db.ThreadModel.count({toc: {$gt: today}, uid: user.uid});
    if(authLevelMin > user.authLevel) ctx.throw(403,`身份认证等级未达要求，发表文章至少需要完成身份认证 ${authLevelMin}`);
    if((!volumeB || !user.volumeB) && (!volumeA || !user.volumeA)) { // a, b考试未开启或用户未通过
      if(!status) ctx.throw(403, '权限不足，请提升账号等级');
      if(!unlimited && countLimit <= todayThreadCount) ctx.throw(403, '今日发表文章次数已用完，请明天再试。');
    }

    // 发表回复时间、条数限制
    const {postToForumCountLimit, postToForumTimeLimit} = await user.getPostLimit();
    if(todayThreadCount >= postToForumCountLimit) ctx.throw(400, `您当前的账号等级每天最多只能发表${postToForumCountLimit}篇文章，请明天再试。`);
    const latestThread = await db.ThreadModel.findOne({uid: user.uid, toc: {$gt: (Date.now() - postToForumTimeLimit * 60 * 1000)}});
    if(latestThread) ctx.throw(400, `您当前的账号等级限定发表文章间隔时间不能小于${postToForumTimeLimit}分钟，请稍后再试。`);

		/*if(user.authLevel < 1) ctx.throw(403,'您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
		if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发帖。');
    if(!user.username) ctx.throw(403, '您的账号还未完善资料，请前往资料设置页完善必要资料。');*/

	  const {post} = body;
		const {c, t, fids, cids} = post;
    if(c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
    if(t === '') ctx.throw(400, '标题不能为空！');

    const {cat, mid} = post;
		const _post = await forum.newPost(post, user, ip, cids, mid, fids);
		data.post = _post;
    const type = ctx.request.accepts('json', 'html');
    // await forum.update({$inc: {'tCount.normal': 1}});
		const thread = await ThreadModel.findOnly({tid: _post.tid});
		// await thread.update({"$set":{mainForumsId: fids, categoriesId:cids}})
		data.thread = thread;
		// 发表自动关注该学科或话题
		const userSubscribe = await UsersSubscribeModel.findOnly({uid:user.uid});
		if(userSubscribe.subscribeForums){
			for(let scr of fids){
				let index = userSubscribe.subscribeForums.indexOf(scr);
				if(index < 0) {
					userSubscribe.subscribeForums.unshift(scr)
				}
			}
			await userSubscribe.update({$set:{subscribeForums:userSubscribe.subscribeForums}});
		}
		const {selectDiskCharacterDown} = ctx.settings.mediaPath;
		const {coverPath, frameImgPath} = ctx.settings.upload;
    const {coverify} = ctx.tools.imageMagick;
		await thread.extendFirstPost();
		await thread.firstPost.extendResources();
		const cover = thread.firstPost.resources.find(e => ['jpg', 'jpeg', 'bmp', 'png', 'svg', 'mp4'].indexOf(e.ext.toLowerCase()) > -1);
		if(cover){
			const middlePath = selectDiskCharacterDown(cover);
			let coverMiddlePath;
			if(cover.ext === "mp4"){
				coverMiddlePath = path.join(path.resolve(frameImgPath), `/${cover.rid}.jpg`);
			}else{
				coverMiddlePath = path.join(middlePath, cover.path);
			}
			let coverExists = await fs.exists(coverMiddlePath);
			if(!coverExists){
				thread.hasCover = false;
				await thread.save();
				// url = `${coverPath}/default.jpg`;
			}else{
				await coverify(coverMiddlePath, `${coverPath}/${_post.tid}.jpg`)
				.catch(e => {
					thread.hasCover = false;
					return thread.save()
				});
			}
			// const middlePath = selectDiskCharacterDown(cover);
			// const coverMiddlePath  = path.join(middlePath, cover.path);
			// if(cover) {
			// 	await coverify(coverMiddlePath, `${coverPath}/${_post.tid}.jpg`)
			// 		.catch(e => {
			// 			thread.hasCover = false;
			// 			return thread.save()
			// 		});
			// }
		}
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
    await db.KcbsRecordModel.insertSystemRecord('postToForum', user, ctx);
		// await db.UsersScoreLogModel.insertLog(obj);

    await thread.updateThreadMessage();
    if(type === 'html') {
      ctx.status = 303;
      return ctx.redirect(`/t/${_post.tid}`);
    }
    data.redirect = `/t/${_post.tid}?&pid=${_post.pid}`;

    //帖子曾经在草稿箱中，发表时，删除草稿
    await db.DraftModel.remove({"did":post.did})
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
		await db.UsersSubscribeModel.updateMany({"subscribeForums":fid}, {"$pull":{"subscribeForums":fid}})
    return next()
  })
	.use('/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
	.use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
	.use(['/home', '/latest', '/followers', '/visitors'], async (ctx, next) => {
		const {data, db, params, query} = ctx;
		const {fid} = params;
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
			if(share.shareUrl.indexOf(ctx.path) === -1) ctx.throw(403, "无效的token")
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

		ctx.template = 'forum/forum.pug';
		await next();
	})
	.use('/latest', latestRouter.routes(), latestRouter.allowedMethods())
	.use('/visitors', visitorRouter.routes(), visitorRouter.allowedMethods())
	.use('/followers', followerRouter.routes(), followerRouter.allowedMethods())
	.use('/home', homeRouter.routes(), homeRouter.allowedMethods())
  .use("/banner", bannerRouter.routes(), bannerRouter.allowedMethods());
module.exports = router;


