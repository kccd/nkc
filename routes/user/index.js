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
const subRouter = require("./sub");
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
  .get("/:uid", async (ctx, next) => {
    const {params, db, data, query, nkcModules} = ctx;
    const {uid} = params;
    const {user} = data;
    const targetUser = await db.UserModel.findOnly({uid});
    await db.UserModel.extendUsersInfo([targetUser]);
    if(user) {
      const subUsers = await db.SubscribeModel.find({
        type: "user",
        uid: user.uid
      }, {
        tUid: 1
      });
      data.subUid = subUsers.map(s => s.tUid);
    }
    const {t, page=0} = query;
    let paging;
    if(!t) {
      const accessibleFid = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, data.user);
      const q = {
        uid,
        mainForumsId: {$in: accessibleFid},
      };
      const count = await db.PostModel.count(q);
      paging = nkcModules.apiFunction.paging(page, count);
      const posts = await db.PostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
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
    data.targetUser = targetUser;
    ctx.template = "/user/user.pug";
    await next();
  })
	//个人名片
  /*.get('/:uid', async (ctx, next) => {
    const {data, db, params,query} = ctx;
    const {user} = data;
    const {uid} = params;
    if(user) {
      const subForums = await db.SubscribeModel.find({
        type: "forum",
        uid: user.uid
      });
      data.subForumsId = subForums.map(s => s.fid);
	    // data.userSubscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
	    data.subscribed = await db.SubscribeModel.findOne({
        type: "user",
        uid: user.uid,
        tUid: uid
      });
	    data.userSubUid = await db.SubscribeModel.getUserSubUid(user.uid);
    }
		const {apiFunction} = ctx.nkcModules;
		const targetUser = await db.UserModel.findOnly({uid});
    await targetUser.extendGrade();
    await db.UserModel.extendUsersInfo([targetUser]);
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
	  // let forumsId = [];
	  const sub = await db.SubscribeModel.find({
      type: "forum",
      fid: {
        $in: visibleFid
      },
      uid: targetUser.uid
    });
	  const forumsId = sub.map(s => s.fid);
	  /!*for (let fid of targetUserSubscribe.subscribeForums) {
		  if (visibleFid.includes(fid) && !forumsId.includes(fid)) {
			  forumsId.push(fid);
		  }
	  }*!/
	  /!*const count = forumsId.length;
	  paging = apiFunction.paging(page, count);
	  forumsId.slice(paging.start, paging.start + paging.perpage);*!/
	  data.targetUserSubscribeforums = await Promise.all(forumsId.map(fid => db.ForumModel.findOnly({fid})));
	  // --------



		// --拿到用户最新的发帖
    data.targetUserThreads = await targetUser.getUsersThreads();
	  // --------



		if (type === 'follow') {
		  const q = {
        type: "user",
        uid: targetUser.uid
      };
		  const count = await db.SubscribeModel.count(q);
      paging = apiFunction.paging(page, count);
		  const sub = await db.SubscribeModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		  const subUid = sub.map(s => s.tUid);
		  const targetUsers = await db.UserModel.find({uid: {$in: subUid}});
		  data.targetUsers = await db.UserModel.extendUsersInfo(targetUsers);
		} else if (type === 'fans') {
      const q = {
        type: "user",
        tUid: targetUser.uid
      };
      const count = await db.SubscribeModel.count(q);
      paging = apiFunction.paging(page, count);
      const sub = await db.SubscribeModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      const subUid = sub.map(s => s.uid);
      const targetUsers = await db.UserModel.find({uid: {$in: subUid}});
      data.targetUsers = await db.UserModel.extendUsersInfo(targetUsers);
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
    let subUsers = await db.SubscribeModel.find({
      type: "user",
      uid: targetUser.uid
    });
    let subUid = subUsers.map(s => s.tUid);
    subUsers = await db.UserModel.find({uid: {$in: subUid}});
    data.newSubscribeUsers = await db.UserModel.extendUsersInfo(subUsers);

    subUsers = await db.SubscribeModel.find({
      type: "user",
      tUid: targetUser.uid
    });
    subUid = subUsers.map(s => s.tUid);
    subUsers = await db.UserModel.find({uid: {$in: subUid}});
    data.newSubscribers = await db.UserModel.extendUsersInfo(subUsers);
	  // --------

		data.type = type;
		data.paging = paging;
		data.targetUser = targetUser;
		data.targetUserSubscribe = targetUserSubscribe;


		ctx.template = 'interface_user.pug';
    await next();
  })*/
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
  .use("/:uid/sub", subRouter.routes(), subRouter.allowedMethods())
	.use('/:uid/production', productionRouter.routes(), productionRouter.allowedMethods());
module.exports = userRouter;
