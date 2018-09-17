const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
	.get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {uid} = params;
		const {type} = query;
		const subscribe = await db.UsersSubscribeModel.findOnly({uid});
		if(type) {
			const {page = 0} = query;
			const count = subscribe[type];
			const paging = nkcModules.apiFunction.paging(page, count);
			let uidArr = subscribe[type].reverse();
			uidArr = uidArr.slice(paging.start, paging.start + paging.perpage);
			const targetUsers = [];
			for(const uid of uidArr) {
				const targetUser = await db.UserModel.findOne({uid});
				if(targetUser) {
					await targetUser.extendGrade();
					targetUsers.push({
						uid: targetUser.uid,
						username: targetUser.username,
						description: targetUser.description,
						grade: targetUser.grade
					});
				}
			}
			data[type] = targetUsers;
			data.paging = paging;
 		}
		data.subscribe = await db.UsersSubscribeModel.findOnly({uid});
		let followIds = data.subscribe.subscribeForums;
		data.targetUserSubscribeforums = await Promise.all(followIds.map(fid => db.ForumModel.findOnly({fid})));
		data.isFuns = false;
		if(data.user && data.subscribe.subscribers.includes(data.user.uid)){
			data.isFuns = true;
		}
		await next();
	});
module.exports = subscribeRouter;