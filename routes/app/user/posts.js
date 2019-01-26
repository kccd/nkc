const Router = require('koa-router');
const postsRouter = new Router();
postsRouter
	.get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {postOnly, page = 0} = query;
		const {uid} = params;

		// 获取能访问的专业ID
		const accessibleFid = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, data.user);

		let operationId;

		if(postOnly) {
			// 仅加载回复
			operationId = ['postToThread'];
		} else {
			operationId = ['postToForum', 'postToThread'];
		}
		const q = {
			uid,
			operationId,
			mainForumsId: {$in: accessibleFid}
		};

		const count = await db.InfoBehaviorModel.count(q);
		const paging = nkcModules.apiFunction.paging(page, count);

		const infoLogs = await db.InfoBehaviorModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);

		const results = [];
		for(const log of infoLogs) {
			const result = {
				type: 'post',

			};
			const post = await db.PostModel.findOne({pid: log.pid, disabled: {$ne: true}});
			if(!post) continue;
			const thread = await db.ThreadModel.findOne({tid: post.tid, recycleMark: {$ne: true}});
			if(!thread) continue;

			result.tid = thread.tid;
			result.pid = post.pid;
			let content = nkcModules.APP_nkc_render.experimental_render(post);
			content = content.replace(/<.*?>/ig, '');
			content = unescape(content.replace(/&#x/g,'%u').replace(/;/g,'').replace(/%uA0/g,' '));
			result.content = content.slice(0, 300);
			result.time = nkcModules.apiFunction.fromNow(post.toc);
			result.thumbUp = post.recUsers.length;

			let firstPost;
			if(thread.oc === post.pid) {
				result.type = 'thread';
				result.postCount = thread.countRemain - 1;
				result.hits = thread.hits;
				result.hasCover = thread.hasCover;
				firstPost = post;
			} else {
				firstPost = await db.PostModel.findOne({pid: thread.oc});
				result.type = 'post';
			}
			result.title = firstPost.t;
			result.firstPostId = firstPost.pid;

			results.push(result);
		}
		data.results = results;
		data.paging = paging;
		await next();
	});
module.exports = postsRouter;