const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
	.post('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {fid} = params;
		const {user} = data;
		const forum = await db.ForumModel.findOnly({fid});

		await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
		const childrenForums = await forum.extendChildrenForums();

		if(childrenForums.length !== 0) {
			ctx.throw(400, '该专业下存在其他专业，无法关注。');
		}

		// 旧的关注专业，会将关注的用户id写入到专业数据中，造成数据庞大
		/*const userSubscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
		const {subscribeForums} = userSubscribe;
		if(subscribeForums.length >= 20) {
			ctx.throw(400, '每个用户最多只能关注20个领域。')
		}
		// 专业表里记录的关注该专业的用户 与 用户表记录的关注专业不相符的情况，不管用户点击关注还是取消关注都可消除误差。
		/!*if(subscribeForums.includes(fid)) {
			ctx.throw(400, '您已经关注该领域，请刷新。');
		}*!/
		await userSubscribe.update({$addToSet: {subscribeForums: fid}});
		await forum.update({$addToSet: {followersId: user.uid}});*/

    // 新的关注专业
    await user.ensureSubLimit("forum");

    let sub = await db.SubscribeModel.findOne({
      uid: user.uid,
      fid,
      type: "forum"
    });

    if(sub) ctx.throw(400, "您已关注过该专业了，请刷新");

    sub = db.SubscribeModel({
      _id: await db.SettingModel.operateSystemID("subscribes", 1),
      uid: user.uid,
      type: "forum",
      fid
    });
    await sub.save();

		await db.KcbsRecordModel.insertSystemRecord('subscribeForum', user, ctx);
		await next();
	})
	.del('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const {fid} = params;
		const forum = await db.ForumModel.findOnly({fid});
		const sub = await db.SubscribeModel.findOne({
      uid: user.uid,
      fid: forum.fid,
      type: "forum"
    });
		if(!sub) ctx.throw(400, "您未关注过该专业，请刷新");
    await sub.remove();
    await db.KcbsRecordModel.insertSystemRecord('unSubscribeForum', user, ctx);
		await next();
	});

module.exports = subscribeRouter;