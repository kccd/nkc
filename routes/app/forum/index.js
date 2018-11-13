const Router = require('koa-router');
const forumRouter = new Router();
forumRouter
	.get('/:fid', async (ctx, next) => {
    const {data, db, query, params} = ctx;
		const {user} = data;
    const {fid} = params;
    const forum = await db.ForumModel.findOnly({fid});
    data.forum = forum;
		let {digest, page, sortby, cat} = query;
		page = page?parseInt(page): 0;
		// 构建查询条件
		const match = {};
		// 获取加精文章
		if(digest) {
			match.digest = true;
			data.digest = digest;
		}
		// 加载某个类别的文章
		if(cat) {
			match.cid = parseInt(cat);
			data.cat = match.cid;
		}
		// 判断是否为该专业或上级专业的专家
		const isModerator = await forum.isModerator(data.user?data.user.uid: '');
		// 拿到该专业下可从中拿文章的所有子专业id
		const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user, forum.fid);
		fidOfCanGetThreads.push(forum.fid);
		match.fid = {$in: fidOfCanGetThreads};
		// 专家可查看专业下所有文章
		// 不是专家但具有displayRecycleMarkThreads操作权限的用户也能查看所有文章
		// 已登录用户能查看专业下未被退回的文章、自己已被退回的文章
		// 未登录用户只能查看未被退回的文章
		if(!isModerator) {
			if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
				if(!data.user) {
					match.recycleMark = {$ne: true};
				} else {
					match.$or = [
						{
							recycleMark: {$ne: true}
						},
						{
							recycleMark: true,
							uid: data.user.uid
						}
					]
				}
			}
		}
		const count = await db.ThreadModel.count(match);
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		const limit = paging.perpage;
		const skip = paging.start;
		let sort;
		if(sortby) {
			sort = {toc: -1};
			data.sortby = sortby;
		} else {
			sort = {tlm: -1};
		}
		const threads = await db.ThreadModel.find(match).sort(sort).skip(skip).limit(limit);
		await Promise.all(threads.map(async thread => {
			await thread.extendFirstPost().then(p => p.extendUser());
			if(thread.lm) {
				await thread.extendLastPost().then(p => p.extendUser());
			} else {
				thread.lastPost = thread.firstPost;
			}
			await thread.extendForum();
			await thread.forum.extendParentForum();
			await thread.extendCategory();
		}));
		for(var i in threads){
			threads[i] = threads[i].toObject();
		}
		data.threads = threads;
		
		// 构建置顶文章查询条件
		// const toppedThreadMatch = {topped: true, fid: forum.fid};
		// if(!isModerator) {
		// 	if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
		// 		if(!data.user) {
		// 			toppedThreadMatch.recycleMark = {$ne: true};
		// 		} else {
		// 			toppedThreadMatch.$or = [
		// 				{
		// 					recycleMark: {$ne: true}
		// 				},
		// 				{
		// 					recycleMark: true,
		// 					uid: data.user.uid
		// 				}
		// 			]
		// 		}
		// 	}
		// }
		// 加载、拓展置顶文章
		// const toppedThreads = await db.ThreadModel.find(toppedThreadMatch).sort({tlm: -1});
		// await Promise.all(toppedThreads.map(async thread => {
		// 	await thread.extendFirstPost().then(p => p.extendUser());
		// 	if(thread.lm) {
		// 		await thread.extendLastPost().then(p => p.extendUser());
		// 	} else {
		// 		thread.lastPost = thread.firstPost;
		// 	}
		// 	await thread.extendForum();
		// 	await thread.forum.extendParentForum();
		// 	await thread.extendCategory();
		// }));
		// data.toppedThreads = toppedThreads;
		data.forumList = await db.ForumModel.find({}).sort({order: 1});
		// data.selectedArr = (await forum.getBreadcrumbForums()).map( f => f.fid);
		// data.selectedArr.push(forum.fid);
		data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		data.threadTypes = await db.ThreadTypeModel.find({fid: forum.fid}).sort({order: 1});
		data.type = 'latest';
		data.isFollow = data.user && data.forum.followersId.includes(data.user.uid);
		await next();
	});
module.exports = forumRouter;