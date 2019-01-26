const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const collectionsRouter = require('./collections');
const billRouter = require('./bills');
const productionRouter = require('./production');
const bannedRouter = require('./banned');
const draftsRouter = require('./drafts');
const settingRouter = require('./settings');
const authRouter = require('./auth');
const transactionRouter = require('./transaction');
const bannerRouter = require('./banner');
const friendsRouter = require('./friends');
const kcbRouter = require('./kcb');
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {username, uid} = query;
    const targetUsers = [];
    if(username !== undefined) {
      // const users = await db.UserModel.find({usernameLowerCase: new RegExp(username.toLowerCase(), 'i')});
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
    if(user) {
	    data.userSubscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
    }
		const {uid} = params;
		const {apiFunction} = ctx.nkcModules;
		const targetUser = await db.UserModel.findOnly({uid});
		await targetUser.extendGrade();
		const targetUserSubscribe = await db.UsersSubscribeModel.findOnly({uid});
		const {type, token} = query;
		const page = query.page?parseInt(query.page): 0;
		let paging;

		// 权限判断		
    if(token){
			let share = await db.ShareModel.findOne({"token":token});
			if(!share) ctx.throw(403, "无效的token");
      // 获取分享限制时间
      let shareLimitTime;
      let allShareLimit = await db.ShareLimitModel.findOne({"shareType":"all"});
			let userShareLimit = await db.ShareLimitModel.findOne({"shareType":"user"});
      if(userShareLimit){
        shareLimitTime = userShareLimit.shareLimitTime;
      }else{
        shareLimitTime = allShareLimit.shareLimitTime;
			}
			let shareTimeStamp = parseInt(new Date(share.toc).getTime());
			let nowTimeStamp = parseInt(new Date().getTime());
			if(nowTimeStamp - shareTimeStamp > 1000*60*60*shareLimitTime){
				await db.ShareModel.update({"token": token}, {$set: {tokenLife: "invalid"}});
			}
			if(share.shareUrl.indexOf(ctx.path) == -1) ctx.throw(403, "无效的token")
		}

		// --拿到关注的领域
		const visibleFid = await db.ForumModel.visibleFid(data.userRoles, data.userGrade, data.user);
	  let forumsId = [];
	  for (let fid of targetUserSubscribe.subscribeForums) {
		  if (visibleFid.includes(fid) && !forumsId.includes(fid)) {
			  forumsId.push(fid);
		  }
	  }
	  /*const count = forumsId.length;
	  paging = apiFunction.paging(page, count);
	  forumsId.slice(paging.start, paging.start + paging.perpage);*/
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

      const accessibleFid = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, data.user);
			const q = {
				uid,
				mainForumsId: {$in: accessibleFid},
				// operationId: {$in: ['postToForum', 'postToThread']}
			};
      const count = await db.PostModel.count(q);
      paging = apiFunction.paging(page, count);
      const posts = await db.PostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
			// const infoLogs = await db.InfoBehaviorModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
			const results = [];
			const displayDisabledPosts = data.userOperationsId.includes('displayDisabledPosts');
			for(const post of posts) {
				if(post.disabled && !displayDisabledPosts) continue;
				if(!post) continue;
        await post.extendUser();
				const thread = await post.extendThread();
				if(thread.recycleMark && !data.userOperationsId.includes('displayRecycleThreads')) continue;
				if(!thread) continue;
				let firstPost;
				let link;
				if(thread.oc === post.pid) {
					firstPost = post;
					link = `/t/${thread.tid}#${thread.oc}`
				} else {
					firstPost = await thread.extendFirstPost();
					await firstPost.extendUser();
					const m = {pid: post.pid};
					if(!displayDisabledPosts) {
						m.disabled = false;
					}
					const obj = await thread.getStep(m);
					link = `/t/${thread.tid}?page=${obj.page}&highlight=${post.pid}#${post.pid}`;
				}
				results.push({
					operation: thread.oc === post.pid?'postToForum': 'postToThread',
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


		ctx.template = 'interface_user.pug';
    await next();
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `推送/取消热门 用户: ${uid}`;
    await next();
  })
  .use('/:uid/kcb', kcbRouter.routes(), kcbRouter.allowedMethods())
	.use('/:uid/transaction', transactionRouter.routes(), transactionRouter.allowedMethods())
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid/collections', collectionsRouter.routes(), collectionsRouter.allowedMethods())
	.use('/:uid/bills', billRouter.routes(), billRouter.allowedMethods())
	.use('/:uid/auth', authRouter.routes(), authRouter.allowedMethods())
	.use('/:uid/banner', bannerRouter.routes(), bannerRouter.allowedMethods())
	.use('/:uid/banned', bannedRouter.routes(), bannedRouter.allowedMethods())
	.use('/:uid/drafts', draftsRouter.routes(), draftsRouter.allowedMethods())
	.use('/:uid/settings', settingRouter.routes(), settingRouter.allowedMethods())
  .use('/:uid/friends', friendsRouter.routes(), friendsRouter.allowedMethods())
	.use('/:uid/production', productionRouter.routes(), productionRouter.allowedMethods());
module.exports = userRouter;