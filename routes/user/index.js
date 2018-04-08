const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const collectionsRouter = require('./collections');
const activitiesRouter = require('./activities');
const billRouter = require('./bills');
const productionRouter = require('./production');
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {username, uid} = query;
    const targetUsers = [];
    if(username !== undefined) {
    	const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
    	if(user) targetUsers.push(user);
    }
    if(uid !== undefined) {
    	const user = await db.UserModel.findOne({uid});
    	if(user) targetUsers.push(user);
    }
    data.targetUsers = targetUsers;
    await next();
  })
	//个人名片
  .get('/:uid', async (ctx, next) => {
    const {data, db, params,query} = ctx;
    const {user} = data;
    if(!user) ctx.throw(403, '请登录后再查看用户的信息。');
		const {uid} = params;
		const {apiFunction} = ctx.nkcModules;
		const targetUser = await db.UserModel.findOnly({uid});
		const targetUserSubscribe = await db.UsersSubscribeModel.findOnly({uid});
		const {type} = query;
		const page = query.page?parseInt(query.page): 0;
		let paging;
		const visibleFid = await ctx.getVisibleFid();
		if(type === 'forums') {
			let forumsId = [];
			for (let fid of targetUserSubscribe.subscribeForums) {
				if (visibleFid.includes(fid) && !forumsId.includes(fid)) {
					forumsId.push(fid);
				}
			}
			const count = forumsId.length;
			paging = apiFunction.paging(page, count);
			forumsId.slice(paging.start, paging.start + paging.perpage);
			data.forums = await Promise.all(forumsId.map(fid => db.ForumModel.findOnly({fid})));
		} else if (type === 'follow') {
			let {subscribeUsers} = targetUserSubscribe;
			const count = subscribeUsers.length;
			paging = apiFunction.paging(page, count);
			subscribeUsers.slice(paging.start, paging.start + paging.perpage);
			data.subscribeUsers = await Promise.all(subscribeUsers.map(uid => db.UserModel.findOnly({uid})));
		} else if (type === 'fans') {
			let {subscribers} = targetUserSubscribe;
			const count = subscribers.length;
			paging = apiFunction.paging(page, count);
			subscribers.slice(paging.start, paging.start + paging.perpage);
			data.subscribers = await Promise.all(subscribers.map(uid => db.UserModel.findOnly({uid})));
		} else {
			const q = {
				uid,
				operation:{
					$in: [
						'postToThread',
						'postToForum'
					]
				},
				type: {
					$in: data.certificates.contentClasses
				}
			};
			const count = await db.UsersBehaviorModel.count(q);
			paging = apiFunction.paging(page, count);
			const targetUserBehaviors = await db.UsersBehaviorModel.find(q).sort({timeStamp: -1}).skip(paging.start).limit(paging.perpage);
			data.results = await Promise.all(targetUserBehaviors.map(async behavior => {
				const {pid, tid, operation} = behavior;
				// 回帖
				const thread = await db.ThreadModel.findOnly({tid});
				const firstPost = await thread.extendFirstPost();
				await firstPost.extendUser();
				let post;
				let link;
				if(operation === 'postToForum') {
					await firstPost.extendResources();
					post = firstPost;
					link = `/t/${tid}#${pid}`
				} else {
					post = await db.PostModel.findOnly({pid});
					const query = {pid};
					if(data.userLevel < 4) {
						query.disabled = false;
					}
					const obj = await thread.getStep(query);
					link = `/t/${tid}?page=${obj.page}&highlight=${pid}#${pid}`;
				}
				return {
					operation,
					thread,
					firstPost,
					post,
					link
				}
			}));
		}
		data.type = type;
		data.paging = paging;
		data.targetUser = targetUser;
		data.targetUserSubscribe = targetUserSubscribe;
		ctx.template = 'interface_user.pug';
    await next();
  })
  .get('/:uid/ban', async (ctx, next) => {
  	const {data, db, params} = ctx;
  	const {uid} = params;
  	const targetUser = await db.UserModel.findOnly({uid});
  	const {certs} = targetUser;
  	if(certs.includes('banned')) {
  		ctx.throw(400, '该用户已经被封禁，请刷新。');
	  }
	  if(certs.indexOf('moderator') >= 0 ||
		  certs.indexOf('editor') >= 0 ||
		  certs.indexOf('dev') >= 0 ||
		  certs.indexOf('scholar') >= 0 ||
		  targetUser.xsf > 0){
			if(data.userLevel < 6) {
				ctx.throw(403, '为什么？你为何要封禁此用户？你是怎么了？');
			}
	  }
	  await targetUser.update({$addToSet: {certs: 'banned'}});
  	await next();
    /*let {uid} = ctx.params;
    let {db} = ctx;
    let targetUser = await db.UserModel.findOnly({uid: uid});
    let certs = targetUser.certs;
    if(certs.indexOf('banned') > -1) ctx.throw(400, '该用户在你操作之前已经被封禁了，请刷新');
    if(
      certs.indexOf('moderator') >= 0 ||
      certs.indexOf('editor') >= 0 ||
      certs.indexOf('dev') >= 0 ||
      certs.indexOf('scholar') >= 0 ||
      targetUser.xsf > 0
    ){
    	if()
      ctx.throw(400, '为什么？你为何要封禁此用户？你是怎么了？');
    }
    await db.UserModel.replaceOne({uid: targetUser.uid}, {$addToSet: {certs: 'banned'}});
    ctx.data.message = `封禁用户成功`;
    await next();*/
  })
  .put('/:uid/ban', async (ctx, next) => {
  	const {db, params} = ctx;
  	const {uid} = params;
  	const targetUser = await db.UserModel.findOnly({uid});
  	if(!targetUser.certs.includes('banned')) {
			ctx.throw(400, '该用户未被封禁，请刷新。');
	  }
	  await targetUser.update({$pull: {certs: 'banned'}});
  	await next();
    /*let {uid} = ctx.params;
    let {db} = ctx;
    let targetUser = await db.UserModel.findOnly({uid: uid});
    let certs = targetUser.certs;
    if(certs.indexOf('banned') === -1) ctx.throw(400, '该用户未被封禁，请刷新');
    await db.UserModel.replaceOne({uid: targetUser.uid}, {$pull: {certs: 'banned'}});
    ctx.data.message = `解封用户成功`;
    await next();*/
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `推送/取消热门 用户: ${uid}`;
    await next();
  })
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid/collections', collectionsRouter.routes(), collectionsRouter.allowedMethods())
	.use('/:uid/bills', billRouter.routes(), billRouter.allowedMethods())
	.use('/:uid/production', productionRouter.routes(), productionRouter.allowedMethods())
  .use('/:uid/activities', activitiesRouter.routes(), activitiesRouter.allowedMethods());
module.exports = userRouter;