const Router = require('koa-router');
const quote = require('./quote');
const history = require('./history');
const credit = require('./credit');
const recommend = require('./recommend');
const digestRouter = require('./digest');
const voteRouter = require('./vote');
const warningRouter = require("./warning");
const anonymousRouter = require("./anonymous");
const hideRouter = require("./hide");
const deleteRouter = require("./delete");
const postRouter = require("./post");
const toppedRouter = require("./topped");
const authorRouter = require("./author");
const resourcesRouter = require("./resources");
const optionRouter = require('./option');
const commentsRouter = require('./comments');
const commentRouter = require('./comment');
const router = new Router();
const customCheerio = require('../../nkcModules/nkcRender/customCheerio');
const { ObjectId } = require('mongodb');

router
  .use('/', async (ctx, next) => {
    const {state, data, db} = ctx;
    await db.ForumModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map(r => r._id),
      gradeId: state.uid? data.userGrade._id: undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .get('/:pid', async (ctx, next) => {
    const {nkcModules, data, db, query, state} = ctx;
		const {token, page=0, highlight, redirect} = query;
    const {pid} = ctx.params;
    data.highlight = highlight;
    data.page = page;
    const post = await db.PostModel.findOnly({pid});
    if(redirect === "true") {
      const url = await db.PostModel.getUrl(post.pid, true);
      return ctx.redirect(url);
    }
    if(data.user) {
      await data.user.extendAuthLevel();
    }
    data.authorAccountRegisterInfo = await db.UserModel.getAccountRegisterInfo({
      uid: post.uid,
      ipId: post.ip
    });
    const thread = await post.extendThread();
    await thread.extendFirstPost();
    data.thread = {
      tid: thread.tid,
      oc: thread.oc,
      firstPost: {
        t: thread.firstPost.t
      }
    };
    data.creditScore = await db.SettingModel.getScoreByOperationType('creditScore');
    if(data.user) {
      data.digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
      data.creditScore = await db.SettingModel.getScoreByOperationType('creditScore');
      data.creditSettings = await db.SettingModel.getCreditSettings();
    }
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
    await db.SettingModel.restrictAccess({
      toc: post.toc,
      forums: forums,
      isAuthor: state.uid && state.uid === post.uid,
      userRolesId: data.userRoles.map(role => role._id),
      userGradeId: data.userGrade._id
    });
    if(!await db.ShareModel.hasPermission(token, pid)) {
      await post.ensurePermission(options);
    }
	  // await post.ensurePermissionNew(options);
		// 拓展其他信息
    // await post.extendUser();
    // await post.extendResources();
    const extendPostOptions = {
      uid: data.user?data.user.uid: "",
      visitor: data.user
    };
    data.post = await db.PostModel.extendPost(post, extendPostOptions);
    data.postUrl = await db.PostModel.getUrl(data.post);
    const {post: postSource} = await db.PostsVoteModel.getVoteSources();
    const voteUp = await db.PostsVoteModel.find({source: postSource, sid: pid, type: 'up'}).sort({toc: 1});
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
    // 读取帖子设置是因为页面读取了这里面的视频遮罩设置
    data.threadSettings = await db.SettingModel.getSettings("thread");
    ctx.template = 'post/post.pug';

    if(data.user) {
      data.complaintTypes = ctx.state.language.complaintTypes;
      data.blacklistUsersId = await db.BlacklistModel.getBlacklistUsersId(data.user.uid);
    }

    /*const from = ctx.get("FROM");

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
    }*/
    // const {threadPostCommentList} = ctx.state.pageSettings;
    // const toDraftPosts = await db.DelPostLogModel.find({modifyType: false, postType: 'post', delType: 'toDraft', threadId: data.post.tid}, {postId: 1, reason: 1});
    // const toDraftPostsId = toDraftPosts.map(post => post.postId);
    /*// 文章页 获取评论 树状
    if(from === "nkcAPI") {
      q.parentPostId = pid;
      const count = await db.PostModel.countDocuments(q);
      let paging = nkcModules.apiFunction.paging(page, count, threadPostCommentList);
      if(paging.page >= paging.pageCount) {
        if(paging.pageCount > 0) paging.page = paging.pageCount - 1;
        else paging.page = 0;
        paging = nkcModules.apiFunction.paging(paging.page, count, threadPostCommentList);
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
      posts = await db.PostModel.extendPosts(posts, extendPostOptions);
      const postsObj = {};
      posts = posts.map(post => {
        const index = toDraftPostsId.indexOf(post.pid);
        if(index !== -1) {
          post.todraft = true;
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
      data.postPermission = await db.UserModel.getPostPermission(state.uid, 'post');
    } else {
      q.parentPostsId = pid;
      // 回复详情页 获取评论 平面
      const count = await db.PostModel.countDocuments(q);
      const paging = nkcModules.apiFunction.paging(page, count, threadPostCommentList);
      let posts = await db.PostModel.find(q).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
      posts = await db.PostModel.extendPosts(posts, extendPostOptions);
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
      parentPosts = await db.PostModel.extendPosts(parentPosts, extendPostOptions);
      parentPosts.map(p => {
        /!*const index = toDraftPostsId.indexOf(post.pid);
        if(index !== -1) {
          post.reason = toDraftPosts[index].reason;
        }*!/
        postsObj[p.pid] = p;
      });
      posts.map(post => {
        post.parentPost = postsObj[post.parentPostId];
      });
      data.posts = posts;
      data.paging = paging;
    }*/
    if(ctx.permission("viewNote")) {
      data.notes = await db.NoteModel.getNotesByPosts([{
        pid: data.post.pid,
        cv: data.post.cv
      }]);
    }
    await next();
  })
  .put('/:pid', async (ctx, next) => {
    let body, files = {};
    if(ctx.body.fields) {
      body = JSON.parse(ctx.body.fields.body);
      files = ctx.body.files;
    } else {
      body = ctx.body;
    }
    const post = body.post;

    const {
      columnMainCategoriesId = [], columnMinorCategoriesId = [], anonymous, t, c, abstractCn, abstractEn, keyWordsCn, keyWordsEn, authorInfos=[], originState,
      survey, did, cover = "", _id
    } = post;
    const {pid} = ctx.params;
    const {state, data, db, nkcModules} = ctx;
    const {user} = data;
    // const authLevel = await user.extendAuthLevel();
	  // if(authLevel < 1) ctx.throw(403,'您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
	  // if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发表回复。');
    if(!c) ctx.throw(400, '参数不正确');
    const targetPost = await db.PostModel.findOnly({pid});
    const _targetPost = targetPost.toObject();
    const targetThread = await targetPost.extendThread();

    if(targetThread.oc === pid) {
      if(t.length < 3) ctx.throw(400, `标题不能少于3个字`);
      if(t.length > 100) ctx.throw(400, `标题不能超过100个字`);
    }

    const content = customCheerio.load(c).text();

    if(content.length < 2) ctx.throw(400, `内容不能少于2个字`);
    // 字数限制
    if(targetPost.parentPostId) {
      // 作为评论 不能超过200字
      if(content.length > 200) ctx.throw(400, `内容不能超过200字`);
    } else {
      // 作为文章、回复 不能超过10万字
      if(content.length > 100000) ctx.throw(400, `内容不能超过10万字`);
    }
    nkcModules.checkData.checkString(c, {
      name: "内容",
      minLength: 1,
      maxLength: 2000000
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



    // 生成历史记录
    await db.HistoriesModel.createHistory(_targetPost);

    // 判断文本是否有变化，有变化版本号加1
    /*if(c !== targetPost.c) {
      targetPost.cv ++;
    }*/
    targetPost.uidlm = user.uid;
    targetPost.iplm = await db.IPModel.saveIPAndGetToken(ctx.address);
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
      if(targetThread.oc === pid) {
        survey.postType = "thread";
      } else {
        survey.postType = "post";
      }
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
    targetPost.toDraft = false;
	  if(targetThread.oc === pid) {
      targetPost.cover = cover;
	  }
    // targetPost.rpid = rpid;
    const q = {
      tid: targetThread.tid
    };
	  await targetPost.save();

    if(targetThread.oc === pid && files && files.postCover) {
      await db.AttachmentModel.savePostCover(pid, files.postCover);
      // await ctx.nkcModules.file.savePostCover(pid, files.postCover);
    }
	  if(!isModerator && !data.userOperationsId.includes('displayDisabledPosts')) {
	  	q.disabled = false;
	  }
    // 转发到专栏
    const userColumn = await db.UserModel.getUserColumn(state.uid);
    if(columnMainCategoriesId.length > 0 && userColumn) {
      await db.ColumnPostModel.addColumnPosts(userColumn, columnMainCategoriesId, columnMinorCategoriesId, [targetThread.oc]);
    }
    data.redirect = await db.PostModel.getUrl(pid);
    data.targetUser = targetUser;
    // 帖子再重新发表时，解除退回的封禁
    // 删除日志中modifyType改为true
    const delPostLog = await db.DelPostLogModel.find({"postId":pid,"modifyType":false});
    for(const log of delPostLog) {
      await log.updateOne({"modifyType":true});
    }
    // 若post被退修则清除退修标记并标记为未审核
    const isThreadContent = targetThread.oc === targetPost.pid;
    if(isThreadContent) {
      if(targetThread.recycleMark) {
        await targetThread.updateOne({
          recycleMark:false,
          reviewed: false
        });
        await targetPost.updateOne({
          reviewed: false
        });
      }
    }
    // 在post中找到这一条数据，并解除屏蔽
    const singlePost = await db.PostModel.findOnly({pid});
    let postReviewed = singlePost.reviewed;
    if(singlePost.disabled && singlePost.toDraft) {
      await singlePost.updateOne({
        disabled: false,
        reviewed: false
      });
      postReviewed = false;
    }

    // 如果符合送审条件，自动内容送审
    const needReview = await db.ReviewModel.autoPushToReview(singlePost);
    if(needReview) {
      await singlePost.updateOne({
        reviewed: false
      });
      if(isThreadContent) {
        await db.ThreadModel.updateOne({ tid: singlePost.tid }, {
          $set: {
            reviewed: false
          }
        });
      }
    }

    await targetThread.updateThreadMessage(false);

    // 帖子曾经在草稿箱中，发表时，删除草稿
    // if(did) {
    //   await db.DraftModel.removeDraftById(did, data.user.uid);
    // }
    if(_id) {
      const beta = (await db.DraftModel.getType()).beta;
      const stableHistory = (await db.DraftModel.getType()).stableHistory;
      const res =await db.DraftModel.updateOne({_id: ObjectId(_id), uid: data.user.uid, type: beta}, {
        $set: {
          type: stableHistory,
          tlm: Date.now()
        }
      });
    }
    await targetUser.updateUserMessage();
    // if(!postReviewed) {
      // await db.MessageModel.sendReviewMessage(singlePost.pid);
    // }
    await next();
  })
  .use("/:pid/hide", hideRouter.routes(), hideRouter.allowedMethods())
  .use('/:pid/history', history.routes(), history.allowedMethods())
	.use('/:pid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:pid/recommend', recommend.routes(), recommend.allowedMethods())
  .use('/:pid/credit', credit.routes(), credit.allowedMethods())
  .use('/:pid/vote', voteRouter.routes(), voteRouter.allowedMethods())
  .use('/:pid/warning', warningRouter.routes(), warningRouter.allowedMethods())
  .use("/:pid/author", authorRouter.routes(), authorRouter.allowedMethods())
  .use('/:pid/quote', quote.routes(), quote.allowedMethods())
  .use("/:pid/topped", toppedRouter.routes(), toppedRouter.allowedMethods())
  .use("/:pid/anonymous", anonymousRouter.routes(), anonymousRouter.allowedMethods())
  .use("/:pid/resources", resourcesRouter.routes(), resourcesRouter.allowedMethods())
  .use("/:pid/post", postRouter.routes(), postRouter.allowedMethods())
  .use("/:pid/option", optionRouter.routes(), optionRouter.allowedMethods())
  .use('/:pid/comments', commentsRouter.routes(), commentsRouter.allowedMethods())
  .use('/:pid/comment', commentRouter.routes(), commentRouter.allowedMethods())
  .use("/:pid/delete", deleteRouter.routes(), deleteRouter.allowedMethods())
module.exports = router;
