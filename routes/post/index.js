const Router = require('koa-router');
const quote = require('./quote');
const history = require('./history');
const credit = require('./credit');
const disabled = require('./disabled');
const recommend = require('./recommend');
const digestRouter = require('./digest');
const voteRouter = require('./vote');
const warningRouter = require("./warning");
const anonymousRouter = require("./anonymous");
const hideRouter = require("./hide");
const postRouter = require("./post");
const Path = require("path");
const toppedRouter = require("./topped");
const authorRouter = require("./author");
const resourcesRouter = require("./resources");
const router = new Router();

router
  .get('/:pid', async (ctx, next) => {
    const {nkcModules, data, db, query} = ctx;
		const {token, page=0, highlight} = query;
    const {pid} = ctx.params;
    data.highlight = highlight;
    const post = await db.PostModel.findOnly({pid});
    const thread = await post.extendThread();
    await thread.extendFirstPost();
    data.thread = {
      tid: thread.tid,
      firstPost: {
        t: thread.firstPost.t
      }
    };
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
        const timeLimit = Number(f.shareLimitTime);
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
			if(share.shareUrl.indexOf(ctx.path) === -1) ctx.throw(403, "无效的token")
		}
	  // await post.ensurePermissionNew(options);
		// 拓展其他信息
    // await post.extendUser();
    // await post.extendResources();
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


    if(!data.post.anonymous) {
      data.post.user = await db.UserModel.findOnly({uid: post.uid});
      await db.UserModel.extendUsersInfo([data.post.user]);
      await data.post.user.extendGrade();
    }
    data.redEnvelopeSettings = await db.SettingModel.getSettings("redEnvelope");
    data.kcbSettings = await db.SettingModel.getSettings("kcb");
    data.xsfSettings = await db.SettingModel.getSettings("xsf");
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
            tid: data.post.tid,
            anonymous: data.post.anonymous
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
    let body, files = {};
    if(ctx.body.fields) {
      body = JSON.parse(ctx.body.fields.body);
      files = ctx.body.files;
    } else {
      body = ctx.body;
    }
    const post = body.post;
    const {
      columnCategoriesId=[], anonymous, t, c, abstractCn, abstractEn, keyWordsCn, keyWordsEn, authorInfos=[], originState,
      survey, did, cover = ""
    } = post;
    const {pid} = ctx.params;
    const {state, data, db, fs} = ctx;
    const {user} = data;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    const authLevel = await userPersonal.getAuthLevel();
	  if(authLevel < 1) ctx.throw(403,'您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
	  if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发表回复。');
    if(!c) ctx.throw(400, '参数不正确');
    const targetPost = await db.PostModel.findOnly({pid});
    if(targetPost.parentPostId && c.length > 1000) ctx.throw(400, "评论内容不能超过1000字节");
    const targetThread = await targetPost.extendThread();
    if(targetThread.oc === pid) {
      ctx.nkcModules.checkData.checkString(t, {
        name: "标题",
        minLength: 6,
        maxLength: 200
      });
    }
    ctx.nkcModules.checkData.checkString(c, {
      name: "内容",
      minLength: 6,
      maxLength: 100000
    });
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
    targetPost.cover = cover;
    targetPost.abstractCn = abstractCn;
    targetPost.abstractEn = abstractEn;
    targetPost.keyWordsCn = keyWordsCn;
    targetPost.keyWordsEn = keyWordsEn;
    const postType = targetPost.pid === targetThread.oc? "postToForum": "postToThread";
    if(anonymous !== undefined && anonymous) {
      if(await db.UserModel.havePermissionToSendAnonymousPost(postType, user.uid, targetPost.mainForumsId)) {
        if(postType !== "postToForum" || !["product", "fund"].includes(targetThread.type)) {
          targetPost.anonymous = true;
        } else {
          ctx.throw(400, "基金类文章和商品类文章不允许匿名发表");
        }
      } else {
        ctx.throw(400, "您没有权限或专业不予许发表匿名内容");
      }
    } else {
      targetPost.anonymous = false;
    }
    // 修改调查表
    if(survey && targetPost.surveyId) {
      survey.mid = data.user.uid;
      await db.SurveyModel.modifySurvey(survey);
    }
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
      targetPost.cover = cover;
	  }
    // targetPost.rpid = rpid;
    const q = {
      tid: targetThread.tid
    };
	  await targetPost.save();

    if(targetThread.oc === pid && files && files.postCover) {
      await ctx.nkcModules.file.savePostCover(pid, files.postCover);
    }
	  if(!isModerator && !data.userOperationsId.includes('displayDisabledPosts')) {
	  	q.disabled = false;
	  }
    // 转发到专栏
    if(columnCategoriesId.length > 0 && state.userColumn) {
      await db.ColumnPostModel.addColumnPosts(state.userColumn, columnCategoriesId, [targetThread.oc]);
    }
    data.redirect = await db.PostModel.getUrl(pid);
    data.targetUser = targetUser;
    // 帖子再重新发表时，解除退回的封禁
    // 删除日志中modifyType改为true
    const delPostLog = await db.DelPostLogModel.find({"postId":pid,"modifyType":false});
    for(const log of delPostLog) {
      await log.update({"modifyType":true});
    }
    // 若post被退修则清除退修标记并标记为未审核
    if(targetThread.oc === targetPost.pid) {
      if(targetThread.recycleMark) {
        await targetThread.update({
          recycleMark:false,
          reviewed: false
        });
        await targetPost.update({
          reviewed: false
        });
      }
    }
    // 在post中找到这一条数据，并解除屏蔽
    const singlePost = await db.PostModel.findOnly({pid});
    let postReviewed = singlePost.reviewed;
    if(singlePost.disabled && singlePost.toDraft) {
      await singlePost.update({
        disabled: false,
        reviewed: false
      });
      postReviewed = false;
    }
    // 帖子曾经在草稿箱中，发表时，删除草稿
    if(did) {
      await db.DraftModel.removeDraftById(did, data.user.uid);
    }
    await targetUser.updateUserMessage();
    if(!postReviewed) {
      // await db.MessageModel.sendReviewMessage(singlePost.pid);
    }
    await next();
  })
  .use("/:pid/hide", hideRouter.routes(), hideRouter.allowedMethods())
  .use('/:pid/history', history.routes(), history.allowedMethods())
	.use('/:pid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:pid/recommend', recommend.routes(), recommend.allowedMethods())
  .use('/:pid/credit', credit.routes(), credit.allowedMethods())
  .use('/:pid/disabled', disabled.routes(), disabled.allowedMethods())
  .use('/:pid/vote', voteRouter.routes(), voteRouter.allowedMethods())
  .use('/:pid/warning', warningRouter.routes(), warningRouter.allowedMethods())
  .use("/:pid/author", authorRouter.routes(), authorRouter.allowedMethods())
  .use('/:pid/quote', quote.routes(), quote.allowedMethods())
  .use("/:pid/topped", toppedRouter.routes(), toppedRouter.allowedMethods())
  .use("/:pid/anonymous", anonymousRouter.routes(), anonymousRouter.allowedMethods())
  .use("/:pid/resources", resourcesRouter.routes(), resourcesRouter.allowedMethods())
  .use("/:pid/post", postRouter.routes(), postRouter.allowedMethods());
module.exports = router;