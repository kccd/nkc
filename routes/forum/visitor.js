const Router = require('koa-router');
const visitorRouter = new Router();
visitorRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, state} = ctx;
		const {pageSettings} = state;
		let {page} = query;
		page = page?parseInt(page): 0;
		let {behaviors} = data;
		const usersId = [];
		for(let b of behaviors) {
			if(!usersId.includes(b.uid)) {
				usersId.push(b.uid);
			}
		}
		const count = usersId.length;
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count, pageSettings.forumUserList);
		data.paging = paging;
		const uid = usersId.slice(paging.start, paging.start + paging.perpage);
		data.visitors = [];
		for(const u of uid) {
			const user = await db.UserModel.findOne({uid: u});
			if(user) {
				data.visitors.push(user);
			}
    }
    await db.UserModel.extendUsersInfo(data.visitors);
    if(data.user) {
      data.userSubUid = await db.SubscribeModel.getUserSubUid(data.user.uid);
    }
		data.type = 'visitors';
		await next();
	});
module.exports = visitorRouter;