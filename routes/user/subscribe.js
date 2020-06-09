const Router = require('koa-router');
const subscribeRouter = new Router();
subscribeRouter
	.get('/register', async (ctx, next) => {
		const {data, db, params, query} = ctx;
		const {uid} = params;
		const {type} = query;
		if(type === 'register') {
			data.type = 'register';
		}
		data.targetUser = await db.UserModel.findOnly({uid});
		const {dbFunction} = ctx.nkcModules;
		const forums = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
		data.forums = await dbFunction.forumsListSort(forums);
		const subForums = await db.SubscribeModel.find({
      uid: data.user.uid,
      type: "forum"
    });
		data.subFid = subForums.map(s => s.fid);
		ctx.template = 'interface_user_subscribe.pug';
		await next();
	})
	.post('/register', async (ctx, next) => {
		const {data, db, params, body} = ctx;
		const {user} = data;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		if(!user || targetUser.uid !== user.uid) ctx.throw(403, '权限不足');
		const {type} = body;
		if(type === 'subscribeForums') {
			const {subscribeForums} = body;
			const subSettings = await db.SettingModel.findById("subscribe");
			const {subForumCountLimit} = subSettings.c;

			if(subscribeForums.length >= subForumCountLimit) ctx.throw(400, `关注专业不能超过${subForumCountLimit}个`);

			for(let fid of subscribeForums) {
				const forum = await db.ForumModel.findOne({fid});
				if(forum) {
					let sub = await db.SubscribeModel.findOne({
            type: "forum",
            fid: forum.fid,
            uid: user.uid
          });
					if(!sub) {
            await db.SubscribeModel({
              _id: await db.SettingModel.operateSystemID('subscribes', 1),
              type: "forum",
              fid: forum.fid,
              uid: user.uid
            }).save();
          }
				}
			}
		}
    const urls = ctx.getCookie("visitedUrls") || [];
    if(urls.length === 0) {
      data.redirect = '/';
    } else {
      data.redirect = urls[0];
    }
		await next();
	})
  // 关注该用户
  .post('/', async (ctx, next) => {
    let {uid} = ctx.params;
    if(!uid) ctx.throw(400, '参数不正确');
    let {db} = ctx;
    let {cid = []} = ctx.body;
    let {user} = ctx.data;
    if(user.uid === uid) ctx.throw(400, '关注自己干嘛？');
    await user.ensureSubLimit("user");
    for(const typeId of cid) {
      const subType = await db.SubscribeTypeModel.findOne({_id: typeId, uid: user.uid});
      if(!subType) ctx.throw(400, `未找到ID为${typeId}的关注分类`);
    }
    let sub = await db.SubscribeModel.findOne({
      type: "user",
      uid: user.uid,
      tUid: uid
    });
    if(sub) ctx.throw(400, '您之前已经关注过该用户了，没有必要重新关注');

    sub = db.SubscribeModel({
      _id: await db.SettingModel.operateSystemID("subscribes", 1),
      type: "user",
      uid: user.uid,
      cid,
      tUid: uid
    });

    await sub.save();
    await db.SubscribeModel.saveUserSubUsersId(user.uid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.data.targetUser = await db.UserModel.findOnly({uid});
    await db.KcbsRecordModel.insertSystemRecord('followed', ctx.data.targetUser, ctx);
    await db.BlacklistModel.removeUserFromBlacklist(user.uid, ctx.data.targetUser.uid);
    await next();
  })
  // 取消关注该用户
  .del('/', async (ctx, next) => {
    let {uid} = ctx.params;
    if(!uid) ctx.throw(400, '参数不正确');
    let {db} = ctx;
    let {user} = ctx.data;
    const sub = await db.SubscribeModel.findOne({
      type: "user",
      uid: user.uid,
      tUid: uid
    });
    if(!sub) ctx.throw(400, '您之前没有关注过该用户，操作无效');
    const cid = sub.cid;
    await sub.remove();
    await db.SubscribeModel.saveUserSubUsersId(user.uid);
    await db.SubscribeTypeModel.updateCount(cid);
    ctx.data.targetUser = await db.UserModel.findOnly({uid});
    await db.KcbsRecordModel.insertSystemRecord('unFollowed', ctx.data.targetUser, ctx);
    await next();
  });

module.exports = subscribeRouter;
