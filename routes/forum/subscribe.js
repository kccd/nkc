const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
	.post('/', async (ctx, next) => {
		const {data, db, params, body} = ctx;
		const {fid} = params;
		const {cid = []} = body;
		const {user} = data;
		const forum = await db.ForumModel.findOnly({fid});

		await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
		const childrenForums = await forum.extendChildrenForums();

		if(childrenForums.length !== 0) {
			ctx.throw(400, '该专业下存在其他专业，无法关注。');
		}

    await user.ensureSubLimit("forum");

		const {subType} = forum;

		if(subType === "unSub") ctx.throw(400, "该专业不可关注");

    let sub = await db.SubscribeModel.findOne({
      uid: user.uid,
      fid,
      type: "forum"
    });

    if(sub) ctx.throw(400, "您已关注过该专业了，请刷新");

    for(const typeId of cid) {
      const type = await db.SubscribeTypeModel.findOne({_id: typeId, uid: user.uid});
      if(!type) ctx.throw(400, `未找到ID为${typeId}的关注分类`);
    }

    sub = db.SubscribeModel({
      _id: await db.SettingModel.operateSystemID("subscribes", 1),
      uid: user.uid,
      cid,
      type: "forum",
      fid
    });
    await sub.save();
    /*await forum.updateOne({
      $inc: {followerCount: 1}
    });*/
    await db.SubscribeModel.saveUserSubForumsId(user.uid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.state._scoreOperationForumsId = [fid];
		await db.KcbsRecordModel.insertSystemRecord('subscribeForum', user, ctx);
		await next();
	})
	.del('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const {fid} = params;
		const forum = await db.ForumModel.findOnly({fid});
		const {subType} = forum;
		if(subType === "force") ctx.throw(400, "关注该专业后不可取消");
		const sub = await db.SubscribeModel.findOne({
      uid: user.uid,
      fid: forum.fid,
      type: "forum"
    });
		if(!sub) ctx.throw(400, "您未关注过该专业，请刷新");
		const {cid} = sub;
    await sub.deleteOne();
    /*await forum.updateOne({
      $inc: {followerCount: -1}
    });*/
    await db.SubscribeModel.saveUserSubForumsId(user.uid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.state._scoreOperationForumsId = [fid];
    await db.KcbsRecordModel.insertSystemRecord('unSubscribeForum', user, ctx);
		await next();
	});

module.exports = subscribeRouter;
