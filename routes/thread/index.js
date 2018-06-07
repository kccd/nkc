const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const nkcModules = require('../../nkcModules');
const apiFn = nkcModules.apiFunction;

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
		// 取出帖子被退回的原因
		if(thread.recycleMark) {
			const threadLogOne = await db.DelPostLogModel.findOne({"threadId":tid,"postType":"thread","delType":"toDraft"});
			thread.reason = threadLogOne.reason || '';
		}
		// 访问用户没有查看被退回帖子的权限，若不是自己发表的文章则报权限不足
		if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
			if(!data.user || thread.uid !== data.user.uid) ctx.throw(403, '权限不足');
		}
		// 验证权限 - new
		const gradeId = data.userGrade._id;
		const rolesId = data.userRoles.map(r => r._id);
		const options = {gradeId, rolesId};
		await thread.ensurePermission(options);
		// 构建查询条件
		let q = {tid};
		const $and = [];
		// 若没有查看被屏蔽的post的权限，判断用户是否为该专业的专家，专家可查看

		// 判断是否为该专业的专家
		const breadcrumbForums = await forum.getBreadcrumbForums();
		let isModerator = false;
		if(data.user) {
			breadcrumbForums.map(forum => {
				if(forum.moderators.includes(data.user.uid)) {
					isModerator = true;
				}
			});
		}
		// 如果是该专业的专家，加载所有的post；如果不是，则判断有没有相应权限。
		if(!isModerator) {
			if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
				if(!data.user) {
					const toDraftPosts = await db.DelPostLogModel.find({threadId: tid, delType: 'toDraft'});
					const toDraftPostsId = toDraftPosts.map(post => post.postId);
					$and.push({pid: {$nin: toDraftPostsId}});
				} else {
					const toDraftPosts = await db.DelPostLogModel.find({threadId: tid, delType: 'toDraft', delUserId: {$ne: data.user.uid}});
					const toDraftPostsId = toDraftPosts.map(post => post.postId);
					$and.push({pid: {$nin: toDraftPostsId}});
				}
			}
			if(!data.userOperationsId.includes('displayDisabledPosts')) {
				if(!data.user) {
					const toRecyclePosts = await db.DelPostLogModel.find({threadId: tid, delType: 'toRecycle'});
					const toRecyclePostsId = toRecyclePosts.map(post => post.postId);
					$and.push({pid: {$nin: toRecyclePostsId}});
				} else {
					const toRecyclePosts = await db.DelPostLogModel.find({threadId: tid, delType: 'toRecycle', delUserId: {$ne: data.user.uid}});
					const toRecyclePostsId = toRecyclePosts.map(post => post.postId);
					$and.push({pid: {$nin: toRecyclePostsId}});
				}
			}
			if($and.length !== 0) q.$and = $and;
		}
		// 统计post总数，分页
		const count = await db.PostModel.count(q);
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;
		// 加载文章所在专业位置，移动文章的选择框
		data.forumList = await db.ForumModel.getVisibleForums(ctx);
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
		ctx.template = 'interface_thread.pug';

		// 删除退休超时的post
		await db.DelPostLogModel.updateMany({delType: 'toDraft', postType: 'post', threadId: tid, modifyType: false, toc: {$lt: Date.now()-3*24*69*69*1000}}, {$set: {delType: 'toRecycle'}});
		let posts;
		if(pid) {
			const matchBase = ctx.generateMatchBase({pid}).toJS();
			const {page, step} = await thread.getStep(matchBase);
			ctx.status = 303;
			return ctx.redirect(`/t/${tid}?&page=${page}&highlight=${pid}#${pid}`);
		} else if(last_page) {
			query.page = data.paging.pageCount - 1;
			data.paging.page = data.paging.pageCount - 1;
			posts = await thread.getPostByQuery(query, q);
		} else {
			posts = await thread.getPostByQuery(query, q);
		}
		const toDraftPosts = await db.DelPostLogModel.find({postType: 'post', delType: 'toDraft', threadId: tid});
		const toDraftPostsId = toDraftPosts.map(post => post.postId);
		posts.map(async post => {
			if(toDraftPostsId.includes(post.pid)) {
				post.todraft = true;
			}
		});

/*
		// 删除退修超时的post
		for(var a in posts){
			if(posts[a].disabled === true){
				var delPostLog = await db.DelPostLogModel.find({"postType":"post","postId":posts[a].pid}).sort({toc:-1});
				if(delPostLog.length > 0){
					if(delPostLog[0].modifyType === false){
						let sysTimeStamp = new Date(delPostLog[0].toc).getTime()
						let nowTimeStamp = new Date().getTime()
						let diffTimeStamp = parseInt(nowTimeStamp) - parseInt(sysTimeStamp)
						let hourTimeStamp = 3600000 * 72;
						let lastTimestamp = parseInt(new Date(delPostLog[0].toc).getTime()) + hourTimeStamp;
						if(diffTimeStamp > hourTimeStamp){
							await delPostLog[0].update({"delType":"toRecycle"})
						}
					}
				}
			}
		}
		// 如果是用户自己的回复，应该添加退修标记
		let postAll = [];
		if(!await thread.ensurePermissionOfModerators(ctx)){
			for(var i in posts){
				// 拿出未被屏蔽的
				if(posts[i].disabled === false){
					postAll.push(posts[i])
					continue
				}
				if(ctx.data.user && posts[i].uid === ctx.data.user.uid){
					let delPostId = posts[i].pid;
					let delPost = await db.DelPostLogModel.find({"postId":delPostId,postType:"post"}).sort({toc:-1}).limit(1)
					if(delPost.length > 0 && delPost[0].delType === "toDraft"){
						posts[i].todraft = true
						postAll.push(posts[i])
					}
				}
			}
		}else{
			for(var i in posts){
				let delPostId = posts[i].pid;
				let delPost = await db.DelPostLogModel.find({"postId":delPostId,postType:"post"}).sort({toc:-1}).limit(1)
				if(delPost.length > 0 && delPost[0].delType === "toDraft" && posts[i].disabled === true){
					posts[i].todraft = true
				}
				postAll.push(posts[i])
			}
		}*/

		data.posts = posts;
		await thread.extendFirstPost().then(p => p.extendUser());
		await thread.extendLastPost();
		await next();
	})
	.post('/:tid', async (ctx, next) => {
		const {
			data, params, db, body, address: ip,
			generateUsersBehavior
		} = ctx;
		const {user} = data;
		if(!user.certs.includes('mobile')) ctx.throw(403,'您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
		if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发表回复。');
		const {tid} = params;
		const {
			ThreadModel,
		} = db;
		const {post} = body;
		if(post.c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
		const thread = await ThreadModel.findOnly({tid});
		const forum = await thread.extendForum();
		const _post = await thread.newPost(post, user, ip);
		data.targetUser = await thread.extendUser();
		await generateUsersBehavior({
			operation: 'postToThread',
			pid: _post.pid,
			tid: thread.tid,
			fid: thread.fid,
			mid: thread.mid,
			type: forum.class,
			toMid: thread.toMid,
		});
		await thread.update({$inc: [{count: 1}, {hits: 1}]});
		const type = ctx.request.accepts('json', 'html');
		await thread.updateThreadMessage();
		await user.updateUserMessage();
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
	.use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;