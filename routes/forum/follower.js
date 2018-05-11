const Router = require('koa-router');
const followerRouter = new Router();
followerRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		let {page} = query;
		page = page?parseInt(page): 0;
		const {apiFunction} = ctx.nkcModules;
		const {forum} = data;
		if(forum.childrenForums.length !== 0) {
			ctx.throw(403, '权限不足');
		}
		const count = forum.followersId.length;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		let followersId = forum.followersId;
		followersId = followersId.reverse();
		followersId = followersId.slice(paging.start, paging.start + paging.perpage);
		data.followers = await Promise.all(followersId.map(uid => db.UserModel.findOne({uid})));
		data.type = 'followers';
		await next();
	});
module.exports = followerRouter;