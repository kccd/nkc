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
		const isModerator = await forum.isModerator(data.user);

		// 拿到该专业下可从中拿文章的所有子专业id
		let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user, forum.fid);
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

		data.threads = await db.ThreadModel.extendThreads(threads, {
		  category: true
    });

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
		data.toppedThreads = await db.ThreadModel.extendThreads(toppedThreads);
    data.forumList = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
		data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		data.threadTypes = await db.ThreadTypeModel.find({fid: forum.fid}).sort({order: 1});
		data.type = 'latest';
		data.isFollow = data.user && data.forum.followersId.includes(data.user.uid);
		await next();
	});
module.exports = latestRouter;