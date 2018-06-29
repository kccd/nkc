const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const nkcModules = require('../../nkcModules');
const digestRouter = require('./digest');
const homeTopRouter = require('./homeTop');
const toppedRouter = require('./topped');
const closeRouter = require('./close');


threadRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		const {from, keywords, applicationFormId, self} = query;
		if(from === 'applicationForm') {
			const outPostObj = (post) => {
				return {
					toc: post.toc.toLocaleString(),
					tid: post.tid,
					username: post.user.username,
					uid: post.uid,
					t: post.t,
					pid: post.pid
				}
			};
			const perpage = (page, length) => {
				const perpage = 20;
				const start = perpage*page;
				return {
					page,
					start,
					perpage,
					pageCount: Math.ceil(length/perpage)
				}
			};
			const page = query.page? parseInt(query.page): 0;
			data.paging = {page: 0, pageCount: 1, perpage: 8};
			const threads = [];
			let targetThreads = [];
			if(self === 'true') {
				const length = await db.ThreadModel.count({uid: user.uid, disabled: false});
				const paging= perpage(page, length);
				targetThreads = await db.ThreadModel.find({uid: user.uid, disabled: false}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
				data.paging = paging;
			} else {
				const applicationForm = await db.FundApplicationFormModel.findOnly({_id: applicationFormId});
				const users = await applicationForm.extendMembers();
				const usersId = users.map(u => u.uid);
				usersId.push(user.uid);
				const post = await db.PostModel.findOne({pid: keywords, uid: {$in: usersId}, disabled: false});
				if(post !== null) {
					await post.extendThread();
					if(post.pid === post.thread.oc) {
						await post.extendUser();
						threads.push(outPostObj(post));
					}
				}
				const targetUser = await db.UserModel.findOne({usernameLowerCase: keywords.toLowerCase()});
				if(targetUser !== null && usersId.includes(targetUser.uid)) {
					const length = await db.ThreadModel.count({uid: targetUser.uid, disabled: false});
					const paging = perpage(page, length);
					targetThreads = await db.ThreadModel.find({uid: targetUser.uid, disabled: false}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
					data.paging = paging;
				}
			}
			for(let t of targetThreads) {
				const post = await t.extendFirstPost();
				await post.extendUser();
				threads.push(outPostObj(post))
			}
			data.threads = threads;
		}
		await next();
	})
	.get('/:tid', async (ctx, next) => {
		const {data, params, db, query, nkcModules} = ctx;
		let {page = 0, pid, last_page, highlight} = query;
		const {tid} = params;
		data.highlight = highlight;
		const thread = await db.ThreadModel.findOnly({tid});
		const forum = await thread.extendForum();
		// 验证权限 - new
		const gradeId = data.userGrade._id;
		const rolesId = data.userRoles.map(r => r._id);
		const options = {gradeId, rolesId, uid: data.user?data.user.uid: ''};
		await thread.ensurePermission(options);
		const isModerator = await forum.isModerator(data.user?data.user.uid: '');
		data.isModerator = isModerator;
		const breadcrumbForums = await forum.getBreadcrumbForums();
		// 判断文章是否被退回或被彻底屏蔽
		if(thread.recycleMark) {
			if(!isModerator) {
				// 访问用户没有查看被退回帖子的权限，若不是自己发表的文章则报权限不足
				if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
					if(!data.user || thread.uid !== data.user.uid) ctx.throw(403, '权限不足');
				}
			}
			// 取出帖子被退回的原因
			const threadLogOne = await db.DelPostLogModel.findOne({"threadId":tid,"postType":"thread","delType":"toDraft"});
			thread.reason = threadLogOne.reason || '';
		}
		// 构建查询条件
		const match = {
			tid
		};
		const $and = [];
		// 若没有查看被屏蔽的post的权限，判断用户是否为该专业的专家，专家可查看

		// 判断是否为该专业的专家
		// 如果是该专业的专家，加载所有的post；如果不是，则判断有没有相应权限。
		if(!isModerator) {
			if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
				const $or = [
					{
						disabled: false
					},
					{
						disabled: true,
						toDraft: {$ne: true}
					}
				];
				// 用户能查看自己被退回的回复
				if(data.user) {
					$or.push({
						disabled: true,
						toDraft: true,
						uid: data.user.uid
					});
				}
				$and.push({$or})
			}
			if(!data.userOperationsId.includes('displayDisabledPosts')) {
				const $or = [
					{
						disabled: false
					},
					{
						disabled: true,
						toDraft: {$ne: false}
					}
				];
				$and.push({$or});
			}
			if($and.length !== 0) match.$and = $and;
		}
		// 统计post总数，分页
		const count = await db.PostModel.count(match);
		const paging_ = nkcModules.apiFunction.paging(page, count);
		const {pageCount} = paging_;
		// 删除退休超时的post
		const postAll = await db.PostModel.find({tid:tid,toDraft:true})
		for(let postSin of postAll){
			let onLog = await db.DelPostLogModel.findOne({delType: 'toDraft', postType: 'post', postId: postSin.pid, modifyType: false, toc: {$lt: Date.now()-3*24*60*60*1000}})
			if(onLog){
				await postSin.update({"toDraft":false})
			}
		}
		await db.DelPostLogModel.updateMany({delType: 'toDraft', postType: 'post', threadId: tid, modifyType: false, toc: {$lt: Date.now()-3*24*60*60*1000}}, {$set: {delType: 'toRecycle'}});
		if(pid) {
			const disabled = data.userOperationsId.includes('displayDisabledPosts');
			const {page, step} = await thread.getStep({pid, disabled});
			ctx.status = 303;
			return ctx.redirect(`/t/${tid}?&page=${page}&highlight=${pid}#${pid}`);
		}
		if(last_page) {
			page = pageCount -1;
		}
		// 查询该文章下的所有post
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;
		const posts = await db.PostModel.find(match).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
		await Promise.all(posts.map(async post => {
			await post.extendUser().then(u => u.extendGrade());
			await post.extendResources();
		}));

		data.posts = posts;
		// 添加给被退回的post加上标记
		const toDraftPosts = await db.DelPostLogModel.find({modifyType: false, postType: 'post', delType: 'toDraft', threadId: tid});
		const toDraftPostsId = toDraftPosts.map(post => post.postId);
		posts.map(async post => {
			if(toDraftPostsId.includes(post.pid)) {
				post.todraft = true;
			}
		});
		// 加载文章所在专业位置，移动文章的选择框
		data.forumList = await db.ForumModel.visibleForums(options);
		data.parentForums = await forum.extendParentForum();
		data.forumsThreadTypes = await db.ThreadTypeModel.find().sort({order: 1});
		data.selectedArr = breadcrumbForums.map(f => f.fid);
		data.selectedArr.push(forum.fid);
		data.cat = thread.cid;
		// 若不是游客访问，加载用户的最新发表的文章
		if(data.user) {
			data.usersThreads = await data.user.getUsersThreads();
		}
		// data.ads = (await db.SettingModel.findOnly({type: 'system'})).ads;
		// 判断是否显示在专栏加精、置顶...按钮
		const {mid, toMid} = thread;
		let myForum, othersForum;
		if(mid !== '') {
			myForum = await db.PersonalForumModel.findOnly({uid: mid});
			data.myForum = myForum
		}

		if(toMid !== '') {
			othersForum = await db.PersonalForumModel.findOnly({uid: toMid});
			data.othersForum = othersForum
		}
		data.targetUser = await thread.extendUser();
		// 文章访问量加1
		await thread.update({$inc: {hits: 1}});
		data.thread = thread;
		data.forum = forum;
		data.replyTarget = `t/${tid}`;
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		data.ads = homeSettings.ads;
		ctx.template = 'thread/index.pug';
		await thread.extendFirstPost().then(async p => {
			await p.extendUser().then(u => u.extendGrade());
			await p.extendResources();
		});
		await thread.extendLastPost();

		// 加载收藏
		data.collected = false;
		if(data.user) {
			const collection = await db.CollectionModel.findOne({uid: data.user.uid, tid});
			if(collection) {
				data.collected = true;
			}
		}

		data.homeSettings = await db.SettingModel.findOnly({type: 'home'});

		if(data.user) {
			data.subscribe = await db.UsersSubscribeModel.findOnly({uid: data.user.uid});
		}

		// 加载用户的帖子
		const fidOfCanGetThreads = await db.ForumModel.fidOfCanGetThreads(options);
		const q = {
			uid: data.targetUser.uid,
			fid: {$in: fidOfCanGetThreads},
			recycleMark: {$ne: true}
		};
		const targetUserThreads = await db.ThreadModel.find(q).sort({toc: -1}).limit(10);
		data.targetUserThreads = [];
		for(const thread of targetUserThreads) {
			await thread.extendFirstPost();
			data.targetUserThreads.push(thread);
		}

		// 相似文章
		data.sameThreads = [];
		if(fidOfCanGetThreads.includes(forum.fid)) {
			const sameThreads = await db.ThreadModel.aggregate([
				{
					$match: {
						fid: forum.fid,
						digest: true,
						recycleMark: {$ne: true}
					}
				},
				{
					$sample: {
						size: 10
					}
				}
			]);
			for(const thread of sameThreads) {
				thread.firstPost = await db.PostModel.findOne({pid: thread.oc});
				data.sameThreads.push(thread);
			}
		}

		// 关注的用户
		if(data.user) {
			data.userSubscribe = await db.UsersSubscribeModel.findOnly({uid: data.user.uid});
		}
		data.targetUserSubscribe = await db.UsersSubscribeModel.findOnly({uid: data.targetUser.uid});
		await next();
	})
	.post('/:tid', async (ctx, next) => {
		const {
			data, params, db, body, address: ip
		} = ctx;
		// 验证用户是否有权限发表回复，硬性条件。
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		// 获取认证等级
		const authLevel = await userPersonal.getAuthLevel();
		if(authLevel < 1) ctx.throw(403,'您的账号还未实名认证，请前往资料设置处绑定手机号码。');
		if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发表回复。');
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
		if(thread.closed) ctx.throw(400, '主题已关闭，暂不能发表回复');
		data.thread = thread;
		await thread.extendForum();
		data.forum = thread.forum;
		// 权限判断
		const gradeId = data.userGrade;
		const rolesId = data.userRoles.map(role => role._id);
		const options = {
			gradeId,
			rolesId,
			uid: data.user?data.user.uid: ''
		};
		await thread.ensurePermission(options);
		const {post} = body;
		if(post.c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
		const _post = await thread.newPost(post, user, ip);
		data.targetUser = await thread.extendUser();

		// 生成记录
		const obj = {
			user,
			type: 'score',
			key: 'postCount',
			typeIdOfScoreChange: 'postToThread',
			tid: post.tid,
			pid: post.pid,
			fid: post.fid,
			ip: ctx.address,
			port: ctx.port
		};
		await db.UsersScoreLogModel.insertLog(obj);
		obj.type = 'kcb';
		await db.UsersScoreLogModel.insertLog(obj);

		await thread.update({$inc: [{count: 1}, {hits: 1}]});
		const type = ctx.request.accepts('json', 'html');
		await thread.updateThreadMessage();
		if(type === 'html') {
			ctx.status = 303;
			return ctx.redirect(`/t/${tid}`)
		}
		data.post = _post;
		data.redirect = `/t/${thread.tid}?&pid=${_post.pid}`;
		//帖子曾经在草稿箱中，发表时，删除草稿
		await db.DraftModel.remove({"desType":post.desType,"desTypeId":post.desTypeId})
		await next();
	})
	.use('/:tid/digest', digestRouter.routes(), digestRouter.allowedMethods())
	.use('/:tid/hometop', homeTopRouter.routes(), homeTopRouter.allowedMethods())
	.use('/:tid/topped', toppedRouter.routes(), toppedRouter.allowedMethods())
	.use('/:tid/close', closeRouter.routes(), closeRouter.allowedMethods())
	.use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;