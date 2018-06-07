const Router = require('koa-router');
const latestRouter = new Router();
latestRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {forum} = data;
		let {digest, page, sortby, cat} = query;
		page = page?parseInt(page): 0;
		// 构建查询条件
		const match = {};
		if(digest) {
			match.digest = true;
			data.digest = digest;
		}
		if(cat) {
			match.cid = parseInt(cat);
			data.cat = q.match.cid;
		}

		const isModerator = await forum.isModerator(data.user?data.user.uid: '');

		const {userGrade, userRoles} = data;
		const options = {
			gradeId: userGrade._id,
			fid: forum.fid
		};
		options.rolesId = userRoles.map(r => r._id);
		// 拿到可从中拿文章的专业id
		const fidOfCanGetThreads = await db.ForumModel.fidOfCanGetThreads(options);
		fidOfCanGetThreads.push(forum.fid);

		match.fid = {$in: fidOfCanGetThreads};
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
		data.threads = threads;
		// 构建置顶文章查询条件
		const toppedThreadMatch = {topped: true, fid: forum.fid};
		if(!isModerator) {
			if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
				if(!data.user) {
					toppedThreadMatch.recycleMark = {$ne: true};
				} else {
					toppedThreadMatch.$or = [
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
		// 加载、拓展置顶文章
		const toppedThreads = await db.ThreadModel.find(toppedThreadMatch).sort({tlm: -1});
		await Promise.all(toppedThreads.map(async thread => {
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
		data.toppedThreads = toppedThreads;
		data.forumList = await db.ForumModel.find({}).sort({order: 1});
		data.selectedArr = (await forum.getBreadcrumbForums()).map( f => f.fid);
		data.selectedArr.push(forum.fid);
		data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		data.threadTypes = await db.ThreadTypeModel.find({fid: forum.fid}).sort({order: 1});
		data.type = 'latest';
		await next();
	});
module.exports = latestRouter;