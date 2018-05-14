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
		data.followers = await db.UserModel.find({uid: {$in: forum.followersId}}).sort({tlv: -1}).skip(paging.start).limit(paging.perpage);
		data.type = 'followers';
		await next();
	});
module.exports = followerRouter;