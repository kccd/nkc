const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const collectionsRouter = require('./collections');
const billRouter = require('./bills');
const productionRouter = require('./production');
const bannedRouter = require('./banned');
const draftsRouter = require('./drafts')
const settingRouter = require('./settings');
const authRouter = require('./auth');
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
    const {data, db, params,query, generateUsersBehavior} = ctx;
    const {user} = data;
    if(user) {
	    data.userSubscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
    }
		const {uid} = params;
		const {apiFunction} = ctx.nkcModules;
		const targetUser = await db.UserModel.findOnly({uid});
		await targetUser.extendGrade();
		const targetUserSubscribe = await db.UsersSubscribeModel.findOnly({uid});
		const {type} = query;
		const page = query.page?parseInt(query.page): 0;
		let paging;

		// --拿到关注的领域
		const visibleFid = await ctx.getVisibleFid();
	  let forumsId = [];
	  for (let fid of targetUserSubscribe.subscribeForums) {
		  if (visibleFid.includes(fid) && !forumsId.includes(fid)) {
			  forumsId.push(fid);
		  }
	  }
	  const count = forumsId.length;
	  paging = apiFunction.paging(page, count);
	  forumsId.slice(paging.start, paging.start + paging.perpage);
	  data.targetUserSubscribeforums = await Promise.all(forumsId.map(fid => db.ForumModel.findOnly({fid})));
	  // --------



		// --拿到用户最新的发帖
	  data.targetUserThreads = await targetUser.getUsersThreads();
	  // --------



		if (type === 'follow') {
			let {subscribeUsers} = targetUserSubscribe;
			const count = subscribeUsers.length;
			paging = apiFunction.paging(page, count);
			subscribeUsers.slice(paging.start, paging.start + paging.perpage);
			data.targetUsers = await Promise.all(subscribeUsers.map(uid => db.UserModel.findOnly({uid})));
		} else if (type === 'fans') {
			let {subscribers} = targetUserSubscribe;
			const count = subscribers.length;
			paging = apiFunction.paging(page, count);
			subscribers.slice(paging.start, paging.start + paging.perpage);
			data.targetUsers = await Promise.all(subscribers.map(uid => db.UserModel.findOnly({uid})));
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
			const results = [];
			for(let behavior of targetUserBehaviors) {
				const {pid, tid, operation} = behavior;
				// 回帖
				const thread = await db.ThreadModel.findOne({tid});
				if(!thread) continue;
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
				if(!await post.ensurePermission(ctx) || !await firstPost.ensurePermission(ctx)) continue;
				results.push({
					operation,
					thread,
					firstPost,
					post,
					link
				});
			}
			data.results = results;
		}

	  // --拿到最新8个关注与最新8个粉丝
	  targetUserSubscribe.subscribeUsers.reverse();
	  targetUserSubscribe.subscribers.reverse();
	  const newSubscribeUsersId = targetUserSubscribe.subscribeUsers.slice(0, 9);
	  const newSubscribersId = targetUserSubscribe.subscribers.slice(0, 9);
	  data.newSubscribeUsers = await Promise.all(newSubscribeUsersId.map(async uid => await db.UserModel.findOnly({uid})));
	  data.newSubscribers = await Promise.all(newSubscribersId.map(async uid => await db.UserModel.findOnly({uid})));
	  // --------

		data.type = type;
		data.paging = paging;
		data.targetUser = targetUser;
		data.targetUserSubscribe = targetUserSubscribe;

		if(data.user) {
			await generateUsersBehavior({
				operation: 'viewUserCard'
			});
		}

		ctx.template = 'interface_user.pug';
    await next();
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `推送/取消热门 用户: ${uid}`;
    await next();
  })
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid/collections', collectionsRouter.routes(), collectionsRouter.allowedMethods())
	.use('/:uid/bills', billRouter.routes(), billRouter.allowedMethods())
	.use('/:uid/auth', authRouter.routes(), authRouter.allowedMethods())
	.use('/:uid/banned', bannedRouter.routes(), bannedRouter.allowedMethods())
	.use('/:uid/drafts', draftsRouter.routes(), draftsRouter.allowedMethods())
	.use('/:uid/settings', settingRouter.routes(), settingRouter.allowedMethods())
	.use('/:uid/production', productionRouter.routes(), productionRouter.allowedMethods());
module.exports = userRouter;