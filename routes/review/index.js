const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "review/review.pug";
    const {nkcModules, data, db, query} = ctx;
    const {page=0, reviewType = 'post'} = query;
    // if(!['post', 'document'].includes(reviewType)) ctx.throw(400, `不存在参数 ${reviewType}`);
    const {user} = data;
    const recycleId = await db.SettingModel.getRecycleId();
    const q = {
      reviewed: false,
      disabled: false,
      mainForumsId: {$ne: recycleId}
    };
    //superModerator 专家权限
    if(!ctx.permission("superModerator")) {
      const forums = await db.ForumModel.find({moderators: user.uid});
      const fid = forums.map(f => f.fid);
      q.mainForumsId = {
        $in: fid
      }
    }
    const {article: articleSource, comment: commentSource, moment: momentSource} = await db.DocumentModel.getDocumentSources();
    const m = {status: 'unknown', type: 'stable', source: {$in: [articleSource, commentSource, momentSource]}};
    //查找出 未审核 未禁用 未退修的post和document的数量
    const postCount = await db.PostModel.countDocuments(q);
    const documentCount = await db.DocumentModel.countDocuments(m);
    //获取审核列表分页
    const paging = nkcModules.apiFunction.paging(page, postCount > documentCount?postCount:documentCount, 30);
    data.results = [];
    //获取需要审核的post
    const tid = new Set(), postUid = new Set();
    let posts = await db.PostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    posts = await db.PostModel.extendPosts(posts, {
      uid: data.user?data.user.uid: '',
      visitor: data.user
    });
    for(const post of posts) {
      tid.add(post.tid);
      postUid.add(post.uid);
    }
    let threads = await db.ThreadModel.find({tid: {$in: [...tid]}, disabled: false});
    threads = await db.ThreadModel.extendThreads(threads, {
      lastPost: false,
      lastPostUser: false,
      forum: true,
      category: false,
      firstPostResource: false
    });
    const postUsers = await db.UserModel.find({uid: {$in: [...postUid]}});
    const postUsersObj = {};
    const threadsObj = {};
    postUsers.map(user => {
      postUsersObj[user.uid] = user;
    });
    threads.map(thread => {
      threadsObj[thread.tid] = thread;
    });
    for(const post of posts) {
      const thread = threadsObj[post.tid];
      if(!thread) continue;
      let user;
      if(post.anonymous) {
        thread.uid = "";
        post.uid = "";
        post.uidlm = "";
      } else {
        user = postUsersObj[post.uid];
        if(!user) continue;
      }
      let type, link;
      if(thread.oc === post.pid) {
        if(thread.recycleMark) {
          continue;
        }
        type = "thread";
        link = `/t/${thread.tid}`;
      } else {
        type = "post";
        link = await db.PostModel.getUrl(post);
      }
      // 从reviews表中读出送审原因
      const reviewRecord = await db.ReviewModel.findOne({ pid: post.pid }).sort({ toc: -1 }).limit(1);
      data.results.push({
        post,
        user,
        thread,
        type,
        link,
        reason: reviewRecord? reviewRecord.reason : "",
      });
    }


    //先查找出需要审核的document
    let documents = await db.DocumentModel.find(m, {
      _id: 1,
      uid: 1,
      did: 1,
      toc: 1,
      title: 1,
      content: 1,
      sid: 1,
      source: 1,
    }).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    // documents = await db.DocumentModel.extendDocuments(documents, {
    //   uid: data.user?data.user.uid:'',
    //   visitor: data.user,
    // });
    const articleDocId = new Set();
    const commentDocId = new Set();
    const momentDocId = new Set();
    const uid = new Set();
    for(const document of documents) {
      document.content = await nkcModules.apiFunction.obtainPureText(document.content, true, 100);
      if(document.source === articleSource) articleDocId.add(document.did);
      if(document.source === commentSource) commentDocId.add(document.did);
      if(document.source === momentSource) momentDocId.add(document.did);
      uid.add(document.uid);
    }
    //拓展动态内容
    let moments = await db.MomentModel.find({did: {$in: [...momentDocId]}});
    moments = await db.MomentModel.extendMomentsData(moments, '', 'did');
    let articles = await db.ArticleModel.find({did: {$in: [...articleDocId]}});
    //拓展article内容
    articles = await db.ArticleModel.extendArticles(articles);
    const {article} = await db.CommentModel.getCommentSources();
    //查找评论
    let comments = await db.CommentModel.find({did: {$in: [...commentDocId]}});
    comments = await db.CommentModel.extendReviewComments(comments);
    const users = await db.UserModel.find({uid: {$in: [...uid]}});
    const usersObj = {};
    const articleObj = {};
    const commentObj = {};
    users.map(user => {
      usersObj[user.uid] = user;
    })
    articles.map(article => {
      articleObj[article.did] = article;
    })
    comments.map(comment => {
      commentObj[comment.did] = comment;
    })
    for(const document of documents) {
      const article =  articleObj[document.did];
      if(!article && document.source === 'article') continue;
      const comment = commentObj[document.did];
      if(!comment && document.source === 'comment') continue;
      const moment = moments[document.did];
      if(!moment && document.source === 'moment') continue;
      let user = usersObj[document.uid];
      if(!user) continue;
      //获取送审原因
      const reviewRecord = await  db.ReviewModel.findOne({docId: document._id}).sort({toc: -1}).limit(1);
      data.results.push({
        type: 'document',
        document,
        content: article || comment || moment,
        user,
        reason: reviewRecord?reviewRecord.reason : '',
      })
    }
    data.reviewType = reviewType;
    data.paging = paging;
    await next();
  })
  .put("/", async (ctx, next) => {
    //审核post和document
    const {data, db, body, state} = ctx;
    const {user} = data;
    let {pid, type: reviewType, docId, pass, reason, remindUser, violation, delType} = body;//remindUser 是否通知用户 violation 是否标记违规 delType 退修或禁用
    if(!reviewType) {
      if(pid) {
        reviewType = 'post';
      } else {
        reviewType = 'document';
      }
    }
    let message;
    const {normal: normalStatus, faulty: faultyStatus, unknown: unknownStatus, disabled: disabledStatus} = await db.DocumentModel.getDocumentStatus();
    const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
    if(reviewType === 'post') {
      const post = await db.PostModel.findOne({pid});

      if(!post) ctx.throw(404, `未找到ID为${pid}的post`);
      if(post.reviewed) ctx.throw(400, "内容已经被审核过了，请刷新");

      const forums = await db.ForumModel.find({fid: {$in: post.mainForumsId}});
      //自己的专业自己可以审核
      let isModerator = ctx.permission('superModerator');
      if(!isModerator) {
        for(const f of forums) {
          isModerator = await f.isModerator(data.user?data.user.uid: '');
          if(isModerator) break;
        }
      }

      if(!isModerator) ctx.throw(403, `您没有权限审核该内容，pid: ${pid}`);

      let type = "passPost";
      //将post标记为已审核
      await post.updateOne({
        reviewed: true
      });
      //通知作者文章/回复,被回复/评论了
      await post.noticeAuthorReply();
      const ip = await db.IPModel.getIpByIpId(post.ipoc);
      //为post生成一条新的动态
      db.MomentModel.createQuoteMomentAndPublish({
        ip,
        uid: post.uid,
        quoteType: momentQuoteTypes.post,
        quoteId: post.pid
      })
        .catch(console.error);
      const thread = await db.ThreadModel.findOnly({tid: post.tid});
      if(thread.oc === post.pid) {
        //将文章标记为已审核
        await thread.updateOne({
          reviewed: true
        });
        type = "passThread";
      }
      //更新文章信息
      await thread.updateThreadMessage(false);
      //生成审核记录
      await db.ReviewModel.newReview(type, post, data.user);
      //生成通知消息
      message = await db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        r: post.uid,
        ty: "STU",
        c: {
          type: "passReview",
          pid: post.pid
        }
      });
    } else {
      const documentStatus = await db.ArticleModel.getArticleStatus();
      if(delType && !documentStatus[delType]) ctx.throw(400, '状态错误');
      const document = await db.DocumentModel.findOne({_id: docId});
      if(!document) ctx.throw(404, `未找到_ID为 ${docId}的文档`);
      const targetUser = await db.UserModel.findOne({uid: document.uid});
      if(pass) {
        if(document.status === normalStatus) ctx.throw(400, '内容已经审核, 请刷新后重试');
        //将document状态改为已审核状态
        await document.setStatus(normalStatus);
        //生成审核记录
        await db.ReviewModel.reviewDocument({
          handlerId: state.uid,
          reason,
          documentId: document._id,
          type: 'passDocument'
        });
        const {source} = document;
        if(momentQuoteTypes[source] && source !== 'moment') {
          //生成一条新的动态
          const ip = await db.IPModel.getIpByIpId(document.ip);
          db.MomentModel.createQuoteMomentAndPublish({
            ip,
            port: document.port,
            uid: document.uid,
            quoteType: momentQuoteTypes[source],
            quoteId: document.sid
          })
            .catch(console.error);
        }
        await db.ReviewModel.newReview('passDocument', '', data.user, reason, document);
        let passType;
        if(document.source === 'article') {
          passType = "documentPassReview";
        } else if(document.source === 'comment') {
          passType = "commentPassReview";
          //如果审核的内容是comment,并且是第一次审核，即判断document的状态是否为unknown,就通知文章作者文章被评论
          const comment = await db.CommentModel.findOnly({_id: document.sid});
          if(comment.status === normalStatus) {
            //通知作者
            await comment.noticeAuthorComment();
          }
        } else if(document.source === 'moment') {
          passType = "momentPass";
        }
        message = await db.MessageModel({
          _id: await db.SettingModel.operateSystemID("messages", 1),
          r: document.uid,
          ty: "STU",
          c: {
            type: passType,
            docId: document._id,
          }
        })
        await document.sendMessageToAtUsers('article');
      } else {
        if(document.status === delType) ctx.throw(400, '内容已经退修/禁用, 请刷新后重试');
        if(!delType) ctx.throw(400, '请选择审核状态');
        //将document状态改为已审核状态
        await document.setStatus(delType);
        //生成退修或删除记录
        const delLog = db.DelPostLogModel({
          delUserId: document.uid,
          userId: user.uid,
          delPostTitle: document?document.title : "",
          reason,
          postType: document.source,
          threadId: document.sid,
          postId: document._id,
          delType: delType,
          noticeType: remindUser
        });
        await delLog.save();
        // await db.ReviewModel.reviewDocument({
        //   handlerId: state.uid,
        //   reason,
        //   documentId: document._id,
        //   type: 'deleteDocument'
        // });
        // await db.ReviewModel.newReview('noPassDocument', '', data.user, reason, document);
        //如果标记用户违规了就给该用户新增违规记录
        if(violation) {
          //新增违规记录
          await db.UsersScoreLogModel.insertLog({
            user: targetUser,
            type: 'score',
            typeIdOfScoreChange: 'violation',
            port: ctx.port,
            delType,
            ip: ctx.address,
            key: 'violationCount',
            description: reason || '屏蔽文档并标记为违规',
          });
          await db.KcbsRecordModel.insertSystemRecord('violation', targetUser, ctx);
          //如果用户违规了就将用户图书中的reviewedCount.article设置为后台设置违规需要发的贴数，用户每发帖一次就将该数量减一，为零时不需要审核
          // await db.UserGeneralModel.resetReviewedCount(document.uid, ['article', 'comment']);
        }
        if(remindUser) {
          let messageType;
          if(document.source === 'article') {
            messageType = delType === 'faulty'?"documentFaulty":"documentDisabled";
          } else if(document.source === 'comment') {
            messageType = delType === 'faulty'?"commentFaulty":"commentDisabled";
          } else if(document.source === 'moment') {
            messageType = 'momentDelete';
          }
          message = db.MessageModel({
            _id: await db.SettingModel.operateSystemID("messages", 1),
            r: document.uid,
            ty: "STU",
            c: {
              delType,
              violation,//是否违规
              type: messageType,
              docId: document._id,
              reason,
            }
          });
        };
      }
    }
    if(message) {
      await message.save();
      //通过socket通知作者
      await ctx.nkcModules.socket.sendMessageToUser(message._id);
    }
    await next();
  });
module.exports = router;
