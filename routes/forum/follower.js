const Router = require('koa-router');
const followerRouter = new Router();
followerRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, state} = ctx;
    const {pageSettings} = state;
    let {page} = query;
		page = page?parseInt(page): 0;
		const {apiFunction} = ctx.nkcModules;
		const {forum} = data;
		if(forum.childrenForums.length !== 0) {
			ctx.throw(403, '权限不足');
		}
		const q = {
		  type: "forum",
      fid: forum.fid,
			cancel: false,
    };
		const count = await db.SubscribeModel.countDocuments(q);
		const paging = apiFunction.paging(page, count, pageSettings.forumUserList);
		data.paging = paging;
		const sub = await db.SubscribeModel.find(q, {uid: 1}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		const uid = sub.map(s => s.uid);
    data.followers = await db.UserModel.find({uid: {$in: uid}}).sort({tlv: -1});
    await db.UserModel.extendUsersInfo(data.followers);
    if(data.user) {
      data.userSubUid = await db.SubscribeModel.getUserSubUsersId(data.user.uid);
    }
    // 排除封禁用户和名片被屏蔽的用户
    if(data.followers && data.followers.length) {
      data.followers = data.followers.filter(u => {
        return !u.certs.includes('banned') && !u.hidden;
      });
    }
		data.type = 'followers';
		await next();
	});
module.exports = followerRouter;