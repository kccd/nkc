const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
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
		const {data, params, db, query, generateUsersBehavior} = ctx;
		let {page = 0, pid, last_page, highlight} = query;
		const {tid} = params;
		const {
			ThreadModel,
			PersonalForumModel,
			SettingModel,
			ForumModel,
			PostModel
		} = db;
		const thread = await ThreadModel.findOnly({tid});
		// 取出帖子被退回的原因
		let threadReason = "";
		if(thread.recycleMark === true){
			let threadLogOne = await db.DelPostLogModel.find({"threadId":tid,"postType":"thread","delType":"toDraft"}).sort({toc:-1}).limit(1)
			if(threadLogOne.length > 0){
				thread.reason = threadLogOne[0].reason;
			}else{
				thread.reason = " ";
			}
		}
		if(thread.recycleMark) {
			if(data.userLevel <= 0) {
				ctx.throw(403, '权限不足');
			} else if(data.userLevel < 6 && data.user.uid !== thread.uid) {
				ctx.throw(403, '权限不足');
			}
		}
		// if(thread.recycleMark === true && ctx.data.userLevel < 6 && (ctx.data.userLevel <= 0 || ctx.data.user.uid !== thread.uid)) ctx.throw(403, '权限不足');
		if(!await thread.ensurePermission(ctx)) ctx.throw(403, '权限不足');
		let q = {
			tid: tid
		};
		data.highlight = highlight;
		let postCount = thread.count;
		if(!await thread.ensurePermissionOfModerators(ctx)) {
			postCount = thread.countRemain;
		}
		data.paging = apiFn.paging(page, postCount);
		const forum = await ForumModel.findOnly({fid: thread.fid});
		const {mid, toMid} = thread;
		// data.forumList = await dbFn.getAvailableForums(ctx);

		data.forumList = await db.ForumModel.getVisibleForums(ctx);
		data.parentForums = await forum.extendParentForum();
		data.forumsThreadTypes = await db.ThreadTypeModel.find().sort({order: 1});

		if(data.user) {
			data.usersThreads = await data.user.getUsersThreads();
		}
		data.ads = (await SettingModel.findOnly({type: 'system'})).ads;
		let myForum, othersForum;
		if(mid !== '') {
			myForum = await PersonalForumModel.findOnly({uid: mid});
			data.myForum = myForum
		}
		if(toMid !== '') {
			othersForum = await PersonalForumModel.findOnly({uid: toMid});
			data.othersForum = othersForum
		}
		data.targetUser = await thread.extendUser();
		await thread.update({$inc: {hits: 1}});
		data.thread = thread;
		data.forum = forum;
		data.selectedArr = (await forum.getBreadcrumbForums()).map( f => f.fid);
		data.selectedArr.push(forum.fid);
		data.cat = thread.cid;
		data.replyTarget = `t/${tid}`;
		ctx.template = 'interface_thread.pug';
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
		//恢复旧版引用
		/*await Promise.all(posts.map(async post => {
			const postContent = post.c || '';
			const index = postContent.indexOf('[quote=');
			if(index !== -1) {
				const targetPid = postContent.slice(postContent.indexOf(',')+1, postContent.indexOf(']'));
				let {page, step} = await thread.getStep({pid: targetPid, disabled: q.disabled});
				page = `?page=${page}`;
				const postLink = `/t/${tid + page}`;
				post.c = postContent.replace(/=/,`=${postLink},${step},`);
			}
		}));*/
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
		}
		data.posts = postAll;
		await thread.extendFirstPost().then(p => p.extendUser());
		await thread.extendLastPost();
		if(data.user) {
			await generateUsersBehavior({
				operation: 'viewThread',
				tid: thread.tid,
				fid: thread.fid
			});
		}
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