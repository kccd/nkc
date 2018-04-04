const Router = require('koa-router');
const subscribeRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
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
		data.forumList = await dbFunction.getAvailableForums(ctx);
		data.subscribe = await db.UsersSubscribeModel.findOnly({uid});
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
			const targetUserSubscribe = await db.UsersSubscribeModel.findOnly({uid});
			await targetUserSubscribe.update({subscribeForums});
		}
		const lastUrl = ctx.cookies.get('lastUrl');
		ctx.cookies.set('lastUrl', '');
		if(!lastUrl) {
			data.url = '/me';
		} else if(lastUrl.includes('kechuang') && !lastUrl.includes('logout')) {
			data.url = lastUrl;
		} else{
			data.url = '/';
		}
		await next();
	})
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    let {fans, page} = ctx.query;
    page = page || 0;
    const {uid} = ctx.params;
    const targetUser = await db.UserModel.findOnly({uid});
    const targetUserSubscribe = await db.UsersSubscribeModel.findOnly({uid});
    let targetUid = [];
    if(fans) {
      targetUid = targetUserSubscribe.subscribers;
      data.fans = true;
    }
    else targetUid = targetUserSubscribe.subscribeUsers;
    const paging = apiFn.paging(page, targetUid.length);
    targetUid = targetUid.slice(paging.start, paging.start + paging.perpage);
    const targetUsers = await Promise.all(targetUid.map(async uid => await db.UserModel.findOnly({uid})));
    data.targetUser = targetUser;
    data.targetUsers = targetUsers;
    data.paging = paging;
    ctx.template = 'interface_subscribe.pug';
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
    ctx.data.message = `关注 uid:${uid} 成功`;
    ctx.data.targetUser = await db.UserModel.findOnly({uid});
    await ctx.generateUsersBehavior({
      operation: 'subscribeUser'
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
    ctx.data.message = `取消关注 uid:${uid} 成功`;
    ctx.data.targetUser = await db.UserModel.findOnly({uid});
    await ctx.generateUsersBehavior({
      operation: 'unsubscribeUser'
    });
    await next();
  });

module.exports = subscribeRouter;