const Router = require('koa-router');
const latestRouter = new Router();
latestRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {forum, user} = data;
		let {digest, page, sortby, cat} = query;
		page = page?parseInt(page): 0;
		const q = {match: {}};
		if(digest) {
			q.match.digest = true;
			data.digest = digest;
		}
		if(cat) {
			q.match.cid = parseInt(cat);
			data.cat = q.match.cid;
		}
		if(data.userLevel < 4 || (data.userLevel === 4 && !forum.moderators.includes(user.uid))) {
			q.match.disabled = false;
		}
		const count = await forum.getThreadsCountByQuery(ctx, q);
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		q.limit = paging.perpage;
		q.skip = paging.start;
		if(sortby) {
			q.sort = {toc: -1};
			data.sortby = sortby;
		} else {
			q.sort = {tlm: -1};
		}
		data.threads = await forum.getThreadsByQuery(ctx, q);
		data.toppedThreads = await forum.getToppedThreads(ctx);
		data.forumList = await db.ForumModel.find({});
		data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		data.threadTypes = await db.ThreadTypeModel.find({fid: forum.fid}).sort({order: 1});
		data.type = 'latest';
		await next();
	});
module.exports = latestRouter;