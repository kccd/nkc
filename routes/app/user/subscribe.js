const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
	.get('/', async (ctx, next) => {
		const {data, db, params, query, nkcModules} = ctx;
		const {uid} = params;
		const {type} = query;

		if(["subscribers", "subscribeUsers"].includes(type)) {
			const {page = 0} = query;
			let q;
			if(type === "subscribers") {
			  q = {
          tUid: uid,
          type: "user"
        };
      } else if(type === "subscribeUsers") {
        q = {
          uid: uid,
          type: "user"
        };
      }
      const count = await db.SubscribeModel.count(q);
			const paging = nkcModules.apiFunction.paging(page, count);
      const subs = await db.SubscribeModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
			let uidArr;
			if(type === "subscribers") {
        uidArr = subs.map(s => s.uid);
      }
			if(type === "subscribeUsers") {
        uidArr = subs.map(s => s.tUid);
      }
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
    data.subscribeUsersCount = await db.SubscribeModel.count({
      type: "user",
      uid
    });
    data.subscribersCount = await db.SubscribeModel.count({
      type: "user",
      tUid: uid
    });
		data.subscribe = await db.UsersSubscribeModel.findOnly({uid});
		let followIds = data.subscribe.subscribeForums;
		data.targetUserSubscribeforums = await Promise.all(followIds.map(fid => db.ForumModel.findOnly({fid})));
		data.isFuns = await db.SubscribeModel.count({
      tUid: uid,
      uid: data.user.uid,
      type: 'user'
    });
		await next();
	});
module.exports = subscribeRouter;