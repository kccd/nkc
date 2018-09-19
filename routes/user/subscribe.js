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
		// data.forumList = await dbFunction.getAvailableForums(ctx);
		// data.subscribe = await db.UsersSubscribeModel.findOnly({uid});
		const options = {
			gradeId: data.userGrade._id,
			rolesId: data.userRoles.map(r => r._id),
			uid
		};
		const forums = await db.ForumModel.accessibleForums(options);
		data.forums = await dbFunction.forumsListSort(forums);
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
		const targetUserSubscribe = await db.UsersSubscribeModel.findOnly({uid});
		// if(targetUserSubscribe.subscribeForums.length !== 0) ctx.throw(400, '您已选择过要关注的领域');
		if(type === 'subscribeForums') {
			const {subscribeForums} = body;
			if(subscribeForums.length > 20) ctx.throw(400, '每个用户最多只能关注20个领域。');
			const realFid = [];
			for(let fid of subscribeForums) {
				const forum = await db.ForumModel.findOne({fid});
				if(forum) {
					const childrenForums = await forum.extendChildrenForums();
					if(!childrenForums || childrenForums.length === 0) {
						if(!realFid.includes(fid)) {
							await forum.update({$addToSet: {followersId: targetUser.uid}});
							realFid.push(fid);
						}
					}
				}
			}
			await targetUserSubscribe.update({subscribeForums: realFid});
		}
		const lastUrl = ctx.cookies.get('lastUrl', {
			signed: true
		});
		ctx.cookies.set('lastUrl', '');
		if(!lastUrl) {
			data.url = `/u/${uid}`;
		} else if(lastUrl.includes('kechuang') && !lastUrl.includes('logout') && !lastUrl.includes('login')) {
			data.url = lastUrl;
		} else{
			data.url = '/';
		}
		await next();
	})
  // 关注该用户
  .post('/', async (ctx, next) => {
    let {uid} = ctx.params;
    if(!uid) ctx.throw(400, '参数不正确');
    let {db} = ctx;
    let {user} = ctx.data;
    if(user.uid === uid) ctx.throw(400, '关注自己干嘛？');
    let subscribersOfDB = await db.UsersSubscribeModel.findOneAndUpdate({uid: uid}, {$addToSet: {subscribers: user.uid}});
    let subscribeUsersOfDB = await db.UsersSubscribeModel.findOneAndUpdate({uid: user.uid}, {$addToSet: {subscribeUsers: uid}});
    if(subscribersOfDB.subscribers.indexOf(user.uid) > -1 && subscribeUsersOfDB.subscribeUsers.indexOf(uid) > -1) ctx.throw(400, '您之前已经关注过该用户了，没有必要重新关注');
    ctx.data.targetUser = await db.UserModel.findOnly({uid});
    await db.UsersScoreLogModel.insertLog({
			user: ctx.data.targetUser,
	    type: 'kcb',
	    typeIdOfScoreChange: 'followed',
	    ip: ctx.address,
	    port: ctx.port
    });
    await next();
  })
  // 取消关注该用户
  .del('/', async (ctx, next) => {
    let {uid} = ctx.params;
    if(!uid) ctx.throw(400, '参数不正确');
    let {db} = ctx;
    let {user} = ctx.data;
    let subscribersOfDB = await db.UsersSubscribeModel.findOneAndUpdate({uid: uid}, {$pull: {subscribers: user.uid}});
    let subscribeUsersOfDB = await db.UsersSubscribeModel.findOneAndUpdate({uid: user.uid}, {$pull: {subscribeUsers: uid}});
    if(subscribersOfDB.subscribers.indexOf(user.uid) === -1 && subscribeUsersOfDB.subscribers.indexOf(uid) === -1) ctx.throw(400, '您之前没有关注过该用户，操作无效');
    ctx.data.targetUser = await db.UserModel.findOnly({uid});
	  await db.UsersScoreLogModel.insertLog({
		  user: ctx.data.targetUser,
		  type: 'kcb',
		  typeIdOfScoreChange: 'unFollowed',
		  ip: ctx.address,
		  port: ctx.port
	  });
    await next();
  });

module.exports = subscribeRouter;