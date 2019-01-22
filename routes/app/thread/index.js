const Router = require('koa-router');
const theradRouter = new Router();
theradRouter
	.get('/:tid', async (ctx, next) => {
    const {data, params, db, query, nkcModules} = ctx;
		let {page = 0, pid, last_page, highlight} = query;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
		const forum = await thread.extendForum();
		// 验证权限 - new
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);

		// 统计post总数
		const count = await db.PostModel.count({tid});
		const paging_ = nkcModules.apiFunction.paging(page, count);
		const {pageCount} = paging_;
		// 查询该文章下的所有post
		const paging = nkcModules.apiFunction.paging(page, count);
		data.paging = paging;
		const posts = await db.PostModel.find({tid}).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
		await Promise.all(posts.map(async post => {
			await post.extendUser().then(u => u.extendGrade());
			await post.extendResources();
		}));
		let index = 0;
		if(paging.page === 0){
			index = 1;
		}
		let newPosts = []
		for(let i = index;i < posts.length;i++){
			if(posts[i].disabled === true){
				continue;
			}
			posts[i] = posts[i].toObject();
			posts[i].c = nkcModules.APP_nkc_render.experimental_render(posts[i]);
			// posts[i].thumbCount = posts[i].recUsers.length;
			posts[i].thumbCount = posts[i].voteUp;
			newPosts.push(posts[i])
		}
		data.targetUser = await thread.extendUser();
		// 文章访问量加1
    await thread.update({$inc: {hits: 1}});
    
		await thread.extendFirstPost().then(async p => {
			await p.extendUser().then(u => u.extendGrade());
			await p.extendResources();
		});
		await thread.extendLastPost();
		thread.firstPost.c = nkcModules.APP_nkc_render.experimental_render(thread.firstPost)
		// console.log(thread.firstPost.c)
		data.thread = thread;

		// 加载收藏
		data.collected = false;
		if(data.user) {
			const collection = await db.CollectionModel.findOne({uid: data.user.uid, tid});
			if(collection) {
				data.collected = true;
			}
		}

		data.homeSettings = (await db.SettingModel.findOnly({_id: 'home'})).c;

		if(data.user) {
			data.subscribe = await db.UsersSubscribeModel.findOnly({uid: data.user.uid});
    }
		// 关注的用户
		if(data.user) {
			data.userSubscribe = await db.UsersSubscribeModel.findOnly({uid: data.user.uid});
    }
    data.replyTarget = `t/${tid}`;
		data.posts = newPosts;
		data.forum = forum;    
		data.thread = data.thread.toObject();
		await next();
	});
module.exports = theradRouter;