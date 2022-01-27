const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "review/review.pug";
    const {nkcModules, data, db, query} = ctx;
    const {page=0, reviewType = 'post'} = query;
    if(!['post', 'document'].includes(reviewType)) ctx.throw(400, `不存在参数 ${reviewType}`);
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
    const m = {status: 'unknown', type: 'stable', source: {$in: ['article', 'comment']}};
    //查找出 未审核 未禁用 未退修的post和document
    const postCount = await db.PostModel.countDocuments(q);
    const documentCount = await db.DocumentModel.countDocuments(m);
    const paging = nkcModules.apiFunction.paging(page, reviewType === 'post'?postCount:documentCount, 100);
    data.results = [];
    if(reviewType === 'post') {
      let posts = await db.PostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      posts = await db.PostModel.extendPosts(posts, {
        uid: data.user?data.user.uid: '',
        visitor: data.user
      });
      const tid = new Set(), uid = new Set();
      for(const post of posts) {
        tid.add(post.tid);
        uid.add(post.uid);
      }
      let threads = await db.ThreadModel.find({tid: {$in: [...tid]}, disabled: false});
      threads = await db.ThreadModel.extendThreads(threads, {
        lastPost: false,
        lastPostUser: false,
        forum: true,
        category: false,
        firstPostResource: false
      });
      const users = await db.UserModel.find({uid: {$in: [...uid]}});
      const usersObj = {};
      const threadsObj = {};
      users.map(user => {
        usersObj[user.uid] = user;
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
          user = usersObj[post.uid];
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
    } else {
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
      const uid = new Set();
      for(const document of documents) {
        document.content = await nkcModules.apiFunction.obtainPureText(document.content, true, 100);
        if(document.source === 'article') articleDocId.add(document.did);
        if(document.source === 'comment') commentDocId.add(document.did);
        uid.add(document.uid);
      }
      let articles = await db.ArticleModel.find({did: {$in: [...articleDocId]}});
      articles = await db.ArticleModel.extendArticles(articles);
      let comments = await db.CommentModel.find({did: {$in: [...commentDocId]}, source: 'comment'});
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
        let user = usersObj[document.uid];
        if(!user) continue;
        //获取送审原因
        const reviewRecord = await  db.ReviewModel.findOne({docId: document._id}).sort({toc: -1}).limit(1);
        data.results.push({
          document,
          content: article || comment,
          user,
          reason: reviewRecord?reviewRecord.reason : '',
        })
      }
    }
    data.reviewType = reviewType;
    data.paging = paging;
    await next();
  })
  .put("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    let {pid, type: reviewType, did, documentId, pass, reason, remindUser, violation, delType} = body;//remindUser 是否通知用户 violation 是否标记违规 delType 退修或禁用
    if(!reviewType) {
      if(pid) {
        reviewType = 'post';
      } else {
        reviewType = 'document';
      }
    }
    let message;
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
      const document = await db.DocumentModel.findOne({_id: documentId});
      if(!document) ctx.throw(404, `未找到_ID未 ${documentId}的文档`);
      if(document.reviewed) ctx.throw(400, '内容已经审核, 请刷新后重试');
      const targetUser = await db.UserModel.findOne({uid: document.uid});
      if(pass) {
        //将document状态改为已审核状态
        await document.updateOne({
          status: 'normal',
        });
        //生成审核记录
        await db.ReviewModel.newReview('passDocument', '', data.user, reason, document);
        message = await db.MessageModel({
          _id: await db.SettingModel.operateSystemID("messages", 1),
          r: document.uid,
          ty: "STU",
          c: {
            type: document.source === 'article'?"documentPassReview":"commentPassReview",
            docId: document._id,
          }
        })
        await document.sendMessageToAtUsers('article');
      } else {
        if(!delType) ctx.throw(400, '请选择退修或者禁用');
        //将document状态改为已审核状态
        await document.updateOne({
          status: delType,
        });
        //生成审核记录
        await db.ReviewModel.newReview('noPassDocument', '', data.user, reason, document);
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
          //如果用户违规了就将用户图书中的reviewedCount.article设置为后台设置违规需要发的贴数，用户每发帖一次就将该数量减一，为零时不需要审核
          // await db.UserGeneralModel.resetReviewedCount(document.uid, ['article', 'comment']);
        }
        if(!remindUser) return;
        let messageType;
        if(document.source === 'article') {
          messageType = delType === 'faulty'?"documentFaulty":"documentDisabled";
        } else {
          messageType = delType === 'faulty'?"commentFaulty":"commentDisabled";
        }
        message = await db.MessageModel({
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
      }
    }
    if(message) {
      await message.save();
      await ctx.nkcModules.socket.sendMessageToUser(message._id);
    }
    await next();
  });
module.exports = router;
