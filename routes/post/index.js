const Router = require('koa-router');
const quote = require('./quote');
const history = require('./history');
const credit = require('./credit');
const disabled = require('./disabled');
const recommend = require('./recommend');
const digestRouter = require('./digest');
const voteRouter = require('./vote');
const warningRouter = require("./warning");
const postRouter = require("./post");
const Path = require("path");
const router = new Router();

router
  .get('/:pid', async (ctx, next) => {
    const {nkcModules, data, db, query} = ctx;
		const {token, page=0, highlight} = query;
    const {pid} = ctx.params;
    data.highlight = highlight;
    const post = await db.PostModel.findOnly({pid});
    const thread = await post.extendThread();
    data.thread = thread;
    await thread.extendFirstPost();
	  const forums = await thread.extendForums(['mainForums', 'minorForums']);
    const {user} = data;
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(data.user?data.user.uid: '');
        if(isModerator) break;
      }
    }
    // 判断用户是否具有访问该post所在文章的权限
    data.isModerator = isModerator;

    if(!thread.reviewed) {
      if(!data.user || (!isModerator && data.user.uid !== thread.uid)) ctx.throw(403, "文章还未通过审核，暂无法阅读");
    }
    if(!post.reviewed) {
      if(!data.user || (!isModerator && data.user.uid !== post.uid)) ctx.throw(403, "回复还未通过审核，暂无法阅读");
    }

    const options = {
    	roles: data.userRoles,
      grade: data.userGrade,
	    isModerator,
	    userOperationsId: data.userOperationsId,
	    user
    };
    // 权限判断		
    if(!token){
      // 权限判断
      await post.ensurePermission(options);
		}else{
			let share = await db.ShareModel.findOne({"token":token});
			if(!share) ctx.throw(403, "无效的token");
      // if(share.tokenLife === "invalid") ctx.throw(403, "链接已失效");
      if(share.tokenLife === "invalid") {
        await post.ensurePermission(options);
      }
      // 获取分享限制时间
      let allShareLimit = await db.ShareLimitModel.findOne({"shareType":"all"});
			if(!allShareLimit){
				allShareLimit = new db.ShareLimitModel({});
				await allShareLimit.save();
      }
      
      let shareLimitTime;
      for(const f of forums) {
        const timeLimit = Number(f.shareLimitTime)
        if(shareLimitTime === undefined || shareLimitTime > timeLimit) {
          shareLimitTime = timeLimit;
        }
      }

      if(shareLimitTime === undefined){
        shareLimitTime = allShareLimit.shareLimitTime;
      }
			let shareTimeStamp = parseInt(new Date(share.toc).getTime());
			let nowTimeStamp = parseInt(new Date().getTime());
			if(nowTimeStamp - shareTimeStamp > 1000*60*60*shareLimitTime){
				await db.ShareModel.update({"token": token}, {$set: {tokenLife: "invalid"}});
        await post.ensurePermission(options);
			}
			if(share.shareUrl.indexOf(ctx.path) == -1) ctx.throw(403, "无效的token")
		}
	  // await post.ensurePermissionNew(options);
		// 拓展其他信息
    await post.extendUser();
    await post.extendResources();
    let posts = await db.PostModel.extendPosts([post], {uid: data.user?data.user.uid: ''});
    data.post = posts[0];
    data.postUrl = await db.PostModel.getUrl(data.post);
    const voteUp = await db.PostsVoteModel.find({pid, type: 'up'}).sort({toc: 1});
    const uid = new Set();
    for(const v of voteUp) {
      uid.add(v.uid);
    }
    const users = await db.UserModel.find({uid: {$in: [...uid]}});
    const usersObj = {};
    for(const u of users) {
      usersObj[u.uid] = u;
    }
    data.voteUpUsers = [];
    for(const v of voteUp) {
      data.voteUpUsers.push(usersObj [v.uid]);
    }


    data.post.user = await db.UserModel.findOnly({uid: post.uid});
    await db.UserModel.extendUsersInfo([data.post.user]);
    await data.post.user.extendGrade();
    data.redEnvelopeSettings = (await db.SettingModel.findOnly({_id: 'redEnvelope'})).c;
    data.kcbSettings = (await db.SettingModel.findOnly({_id: 'kcb'})).c;
    data.xsfSettings = (await db.SettingModel.findOnly({_id: 'xsf'})).c;
    data.thread = thread;
    ctx.template = 'post/post.pug';

    if(data.user) data.complaintTypes = ctx.state.language.complaintTypes;

    const from = ctx.get("FROM");

    // 修改post时间限制
    data.modifyPostTimeLimit = await db.UserModel.getModifyPostTimeLimit(data.user);
    // 获取评论
    const q = {};
    // 判断是否有权限查看未审核的post
    if(data.user) {
      if(!isModerator) {
        q.$and = [
          {
            $or: [
              {
                reviewed: true
              },
              {
                reviewed: false,
                uid: data.user.uid
              }
            ]
          },
          {
            $or: [
              {
                disabled: false,
                toDraft: {$ne: true},
              },
              {
                toDraft: true,
                uid: data.user.uid
              }
            ]
          }
        ];
      }
    } else {
      q.reviewed = true;
      q.disabled = false;
      q.toDraft = null;
    }
    const {threadPostCommentList} = ctx.state.pageSettings;
    const toDraftPosts = await db.DelPostLogModel.find({modifyType: false, postType: 'post', delType: 'toDraft', threadId: data.post.tid}, {postId: 1, reason: 1});
    const toDraftPostsId = toDraftPosts.map(post => post.postId);
    // 文章页 获取评论 树状
    if(from === "nkcAPI") {
      q.parentPostId = pid;
      const count = await db.PostModel.count(q);
      const paging = nkcModules.apiFunction.paging(page, count, threadPostCommentList);
      if(paging.page >= paging.pageCount) {
        if(paging.pageCount > 0) paging.page = paging.pageCount - 1;
        else paging.page = 0;
        paging.start = paging.page * paging.perpage
      }
      let parentPosts = await db.PostModel.find(q).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
      const pids = new Set();
      parentPosts.map(p => {
        pids.add(p.pid);
      });
      delete q.parentPostId;
      q.parentPostsId = {$in: [...pids]};
      let posts = await db.PostModel.find(q).sort({toc: 1});
      posts = posts.concat(parentPosts);
      posts = await db.PostModel.extendPosts(posts, {uid: data.user? data.user.uid: ""});
      const postsObj = {};
      posts = posts.map(post => {
        const index = toDraftPostsId.indexOf(post.pid);
        if(index !== -1) {
          post.reason = toDraftPosts[index].reason;
        }
        post.posts = [];
        post.parentPost = "";
        postsObj[post.pid] = post;
        return post;
      });
      const topPosts = [];

      for(const post of posts) {
        post.url = await db.PostModel.getUrl(post);
        if(post.parentPostId === pid) {
          post.parentPost = {
            user: data.post.user,
            pid: data.post.pid,
            uid: data.post.uid,
            tid: data.post.tid
          };
          topPosts.push(post);
          continue;
        }
        let parent;
        if(post.parentPostsId.length >= 5) {
          // 限制层数 3
          parent = postsObj[post.parentPostsId[4]];
        } else {
          parent = postsObj[post.parentPostId];
        }
        if(parent) {
          post.parentPost = {
            user: parent.user,
            pid: parent.pid,
            uid: parent.uid,
            tid: parent.tid
          };
          parent.posts.push(post);
        }
      }
      data.posts = topPosts;
      data.paging = paging;
      const template = Path.resolve("./pages/thread/comments.pug");
      data.html = nkcModules.render(template, data, ctx.state);
    } else {
      q.parentPostsId = pid;
      // 回复详情页 获取评论 平面
      const count = await db.PostModel.count(q);
      const paging = nkcModules.apiFunction.paging(page, count, threadPostCommentList);
      let posts = await db.PostModel.find(q).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
      posts = await db.PostModel.extendPosts(posts, {uid: data.user? data.user.uid: ""});
      const parentPostsId = new Set();
      await Promise.all(posts.map(async post => {
        post.url = await db.PostModel.getUrl(post);
        const index = toDraftPostsId.indexOf(post.pid);
        if(index !== -1) {
          post.reason = toDraftPosts[index].reason;
        }
        parentPostsId.add(post.parentPostId);
      }));
      // 拓展上级post
      let parentPosts = await db.PostModel.find({pid: {$in: [...parentPostsId]}});
      const postsObj = {};
      parentPosts = await db.PostModel.extendPosts(parentPosts, {uid: data.user? data.user.uid: ""});
      parentPosts.map(p => {
        /*const index = toDraftPostsId.indexOf(post.pid);
        if(index !== -1) {
          post.reason = toDraftPosts[index].reason;
        }*/
        postsObj[p.pid] = p;
      });
      posts.map(post => {
        post.parentPost = postsObj[post.parentPostId];
      });
      data.posts = posts;
      data.paging = paging;
    }
    await next();
  })
  .patch('/:pid', async (ctx, next) => {
    const {t, c, desType, desTypeId, abstractCn, abstractEn, keyWordsCn, keyWordsEn, authorInfos=[], originState} = ctx.body.post;
    if(c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
    const {pid} = ctx.params;
    const {data, db, fs} = ctx;
    const {user} = data;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    const authLevel = await userPersonal.getAuthLevel();
	  if(authLevel < 1) ctx.throw(403,'您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
	  if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发表回复。');
    if(!c) ctx.throw(400, '参数不正确');
    const targetPost = await db.PostModel.findOnly({pid});
    if(targetPost.parentPostId && c.length > 1000) ctx.throw(400, "评论内容不能超过1000字节");
    const targetThread = await targetPost.extendThread();
    const targetForums = await targetThread.extendForums(['mainForums']);
    let isModerator;
    for(let targetForum of targetForums){
      isModerator = await targetForum.isModerator(user.uid);
      if(isModerator) break;
    }
    // const isModerator = await targetForum.isModerator(user.uid);
    // 权限判断
    if(!data.userOperationsId.includes('modifyOtherPosts') && !isModerator) {
    	if(user.uid !== targetPost.uid) ctx.throw(403, '您没有权限修改别人的回复');
    	if(targetPost.disabled && !targetPost.toDraft) {
    		ctx.throw(403, '回复已被屏蔽，暂不能修改');
	    }
    }
    if(targetThread.oc === pid && targetThread.type === "fund") {
      ctx.throw(403, "无法编辑科创基金类文章");
    }
    if(targetThread.oc === pid && !t) ctx.throw(400, '标题不能为空!');
    const targetUser = await targetPost.extendUser();

    if(targetThread.type !== "product") {

      // 修改回复的时间限制
      let modifyPostTimeLimit = 0;
      for(const r of data.userRoles) {
        if(r.modifyPostTimeLimit === -1) {
          modifyPostTimeLimit = -1;
          break;
        }
        if(r.modifyPostTimeLimit > modifyPostTimeLimit) {
          modifyPostTimeLimit = r.modifyPostTimeLimit;
        }
      }
      if(modifyPostTimeLimit !== -1 && (Date.now() - targetPost.toc.getTime() > modifyPostTimeLimit*60*60*1000))
        ctx.throw(403, `您只能需改${modifyPostTimeLimit}小时前发表的内容`);

    }



    const objOfPost = Object.assign(targetPost, {}).toObject();
    objOfPost._id = undefined;
    const histories = new db.HistoriesModel(objOfPost);
    await histories.save();
    // const quote = await dbFn.getQuote(c);
    // let rpid = '';
    // if(quote && quote[2]) {
    //   rpid = quote[2];
    //   const username = quote[1];
    //   if(rpid !== targetPost.pid) {
    //     const quoteUser = await db.UserModel.findOne({username: username});
    //     const newReplies = new db.ReplyModel({
    //       fromPid: pid,
    //       toPid: rpid,
    //       toUid: quoteUser.uid
    //     });
    //     await newReplies.save();
    //   }
    // }
    targetPost.uidlm = user.uid;
    targetPost.iplm = ctx.address;
    targetPost.t = t;
    targetPost.c = c;
    targetPost.abstractCn = abstractCn;
    targetPost.abstractEn = abstractEn;
    targetPost.keyWordsCn = keyWordsCn;
    targetPost.keyWordsEn = keyWordsEn;
    let newAuthInfos = [];
    for(let a = 0;a < authorInfos.length;a++) {
      if(authorInfos[a].name.length > 0) {
        newAuthInfos.push(authorInfos[a])
      }else{
        let kcUser = await db.UserModel.findOne({uid: authorInfos[a].kcid});
        if(kcUser) {
          authorInfos[a].name = kcUser.username;
          newAuthInfos.push(authorInfos[a])
        }
      }
    }
    targetPost.authorInfos = newAuthInfos;
    targetPost.originState = originState;
    targetPost.tlm = Date.now();
	  if(targetThread.oc === pid) {
			await targetThread.update({hasCover: true});
			const {coverPath} = ctx.settings.upload;
			if(targetThread.tid) {
				const path = coverPath + '/' + targetThread.tid + '.jpg';
				try {
					await fs.access(path);
					await fs.unlink(path);
				} catch(e) {
					// 之前不存在封面图
				}

			}

	  }
    // targetPost.rpid = rpid;
    const q = {
      tid: targetThread.tid
    };
	  await targetPost.save();
	  if(!isModerator && !data.userOperationsId.includes('displayDisabledPosts')) {
	  	q.disabled = false;
	  }
    let {page} = await targetThread.getStep({pid, disabled: q.disabled});
    let postId = `#${pid}`;
    page = `?page=${page}`;
    const redirectUrl = await db.PostModel.getUrl(pid);
    // data.redirect = `/t/${targetThread.tid}?&pid=${targetPost.pid}`;
    data.redirect = redirectUrl;
    data.targetUser = targetUser;
    // 帖子再重新发表时，解除退回的封禁
    // 删除日志中modifyType改为true
    let delPostLog = await db.DelPostLogModel.find({"postId":pid,"modifyType":false})
    for(var i in delPostLog){
      await delPostLog[i].update({"modifyType":true})
    }
    await targetThread.update({"recycleMark":false})
    // 在post中找到这一条数据，并解除屏蔽
    let singlePost = await db.PostModel.findOnly({pid})
    await singlePost.update({disabled:false})
    // 帖子曾经在草稿箱中，发表时，删除草稿
    await db.DraftModel.remove({"desType":desType,"desTypeId":desTypeId})
    await targetUser.updateUserMessage();
    if(!singlePost.reviewed) {
      await db.MessageModel.sendReviewMessage(singlePost.pid);
    }
    await next();
  })
  .use('/:pid/history', history.routes(), history.allowedMethods())
	.use('/:pid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:pid/recommend', recommend.routes(), recommend.allowedMethods())
  .use('/:pid/credit', credit.routes(), credit.allowedMethods())
  .use('/:pid/disabled', disabled.routes(), disabled.allowedMethods())
  .use('/:pid/vote', voteRouter.routes(), voteRouter.allowedMethods())
  .use('/:pid/warning', warningRouter.routes(), warningRouter.allowedMethods())
  .use('/:pid/quote', quote.routes(), quote.allowedMethods())
  .use("/:pid/post", postRouter.routes(), postRouter.allowedMethods());
module.exports = router;