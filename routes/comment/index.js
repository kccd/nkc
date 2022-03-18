const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    //获取该图书下的全部评论和用户编辑框中未发布的内容
    const {db, data, state, query, permission} = ctx;
    const {sid} = query;
    const {user} = data;
    let comments = await db.CommentModel.find({sid, source: 'comment'}).sort({toc: 1});
    let comment = await db.CommentModel.findOne({uid: state.uid, source: 'comment'}).sort({toc: -1}).limit(1);
    const book = await db.BookModel.findOne({_id: sid});
    //管理员权限
    const permissions = {
      reviewed: null,
      disabled: null,
    };
    if(user) {
      //审核权限
      if(permission('review')) {
        permissions.reviewed = true;
      }
      //禁用和退修权限
      if(ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft')) {
        permissions.disabled = true
      }
    }
    //获取当前用户对该图书的权限
    // const bookPermission = await book.getBookPermissionForUser(state.uid);
    comments = await db.CommentModel.extendPostComments({comments, uid: state.uid, permissions});
    let document;
    if(comment) {
      document = await db.DocumentModel.findOne({did: comment.did, type: 'beta'});
    }
    if(document) {
      comment.content = document.content;
      comment = comment.toObject();
    } else {
      comment = '';
    }
    //评论权限
    data.permissions = permissions;
    data.comment = comment;
    data.comments = comments;
    await next();
  })
  .get('/:_id/quote', async (ctx, next) => {
    //获取引用数据
    const {db, data, params, query, nkcModules} = ctx;
    const {_id} = params;
    let {source} = query;
    source = (await db.CommentModel.getCommentSources())[source];
    const {stable: stableType} = await db.DocumentModel.getDocumentTypes();
    const {normal: normalStatus} = await db.DocumentModel.getDocumentStatus();
    //获取被引用的文档
    const document = await db.DocumentModel.findOne({_id, type: stableType});
    if(document.status !== normalStatus) ctx.throw(403, '权限不足');
    if(!document) ctx.throw(400, '未找到引用信息，请刷新后重试');
    let comment = await db.CommentModel.findOne({did: document.did});
    if(!comment) ctx.throw(400, '未找到引用信息，请刷新后重试');
    comment = await db.CommentModel.extendPostComments({comments: [comment]});
    const {order, _id: commentId, user, did, sid, source: commentSource, docId} = comment[0];
    data.quote = {
      _id: commentId,
      order,
      docId,
      comment: comment[0],
      ...user,
      did,
      sid,
      commentSource,
      content: nkcModules.nkcRender.htmlToPlain(document.content, 100)
    }
    await next();
  })
  .get('/:_id/commentEditor', async (ctx, next) => {
    //获取需要编辑的评论的内容
    const {db, data, params, state} = ctx;
    const {_id} = params;
    let comment = await db.CommentModel.findOne({_id});
    if(comment.uid !== state.uid) return ctx.throw(401, '权限不足！');
    //获取测试版评论，如果每页就获取正式版
    comment = await comment.extendEditorComment();
    data.comment = comment;
    await next();
  })
  .post('/', async (ctx, next) => {
    //创建，修改，发布评论
    const {db, body, data, state, nkcModules} = ctx;
    const {
      source,
      sid,
      content,
      quoteDid,
      type,
      commentId,
      commentType, //用于判断当前提交的数据的sid是articleId还是articlePostId
    } = body;
    let articlePost;
    //当sid为comment的sid时
    if(commentType === 'comment') {
      //获取引用id
      articlePost = await db.ArticlePostModel.findOnly({_id: sid});
      if(!articlePost) ctx.throw(400, '未找到引用，请刷新');
    }
    let article = await db.ArticleModel.findOnly({_id: articlePost?articlePost.sid:sid});
    if(!article) ctx.throw(400, '未找到文章，请刷新后重试');
    const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
    if(article.status !== normalStatus) {
      return ctx.throw(403, '文章状态异常');
    }
    if(!['modify', 'publish', 'create', 'save'].includes(type)) ctx.throw(400, `未知的提交类型 type: ${type}`);
    let comment;
    if(type === 'create') {
      comment = await db.CommentModel.createComment({
        uid: state.uid,
        content,
        quoteDid,
        source: article.source,
        sid,
        ip: ctx.address,
        port: ctx.port
      });
    } else {
      comment = await db.CommentModel.findOne({_id: commentId});
      await comment.modifyComment({
        quoteDid,
        content
      });
      if(type === 'publish') {
        const key = await nkcModules.getRedisKeys('commentOrder', article._id);
        const lock = await nkcModules.redLock.lock(key, 6000);
        try{
          // 获取最新评论的楼层
          const order = await db.CommentModel.getCommentOrder(article._id);
          await comment.updateOrder(order);
          await comment.publishComment();
          //更新评论引用的评论数replies
          await db.ArticlePostModel.updateOrder(order, article._id);
          await lock.unlock();
        } catch (err){
          await lock.unlock();
          throwErr(500, err);
        }
      } else if(type === 'save') {
        await comment.saveComment()
      }
    }
    data.commentId = comment._id;
    await next();
  })
  //废除， 评论退修或者禁用在审核路由传入docId即可
  .post('/:_id/disabled', async (ctx, next) => {
    //评论退修或禁用
    const {db, data, params, permission, body, state} = ctx;
    const {_id} = params;
    const {type: status, remindUser, violation, reason} = body;
    if(!['faulty', 'disabled'].includes(status)) ctx.throw(401, '错误类型');
    if(!permission('disabledComment')) ctx.throw(403, '权限不足');
    const comment = await db.CommentModel.findOne({_id});
    if(!comment) ctx.throw(401, '未找到评论， 请刷新后重试！');
    const document = await db.DocumentModel.findOne({did: comment.did, type: 'stable'});
    if(!document) return ctx.throw(400, '未找到评论');
    if(status === 'faulty' && document.status === 'faulty') return ctx.throw(401, '评论已被退修');
    if(status === 'disabled' && document.status === 'disabled') return ctx.throw(401, '评论已被禁用');
    //查找当前document的审核记录
    let review = await db.ReviewModel.findOne({docId: document._id}).sort({toc: -1}).limit(1);
    //如果不存在审核记录就创建一条记录
    if(!review) {
      review = await db.ReviewModel({
        _id: await db.SettingModel.operateSystemID('reviews', 1),
        type: status === 'faulty'?'returnDocument':'disabledDocument',
        reason,
        docId: document._id,
        uid: comment.uid,
      });
      await review.save();
    }
    //更新审核记录的处理人
    await review.updateReview({uid: state.uid, type: status === 'faulty'?'returnDocument':'disabledDocument', reason});
    const targetUser = await db.UserModel.findOne({uid: document.uid});
    await document.setStatus(status);
    //标记违规
    if(violation) {
      //新增违规记录
      await db.UsersScoreLogModel.insertLog({
        user: targetUser,
        type: 'score',
        typeIdOfScoreChange: 'violation',
        port: ctx.port,
        delType: status,
        ip: ctx.address,
        key: 'violationCount',
        description: reason || '屏蔽文档并标记为违规',
      });
      //如果用户违规了就将用户图书中的reviewedCount.article设置为后台设置违规需要发的贴数，用户每发帖一次就将该数量减一，为零时不需要审核
      // await db.UserGeneralModel.resetReviewedCount(document.uid, ['article', 'comment']);
    }
    //通知用户
    if(remindUser) {
      const message = await db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        r: document.uid,
        ty: "STU",
        c: {
          delType: status,
          violation,//是否违规
          type: status === 'faulty'?'commentFaulty':'commentDisabled',
          docId: document._id,
          reason,
        }
      });
      if(message) {
        await message.save();
        await ctx.nkcModules.socket.sendMessageToUser(message._id);
      }
    }
    await next();
  })
  .post('/:_id/unblock', async (ctx, next) => {
    const {db, data, body, params, state} = ctx;
    const {_id} = params;
    const document = await db.DocumentModel.findOnly({_id});
    if(!document) ctx.throw(400, `未找到ID为${_id}的document`);
    const comment = await db.CommentModel.findOnly({_id: document.sid});
    if(!comment) ctx.throw(400, `未找到ID为${document.sid}的comment`);
    const isModerator = ctx.permission('superModerator') || bookPermission === 'admin'?true:false;
    if(!isModerator) ctx.throw(403, `您没有权限处理ID为${document._id}的document`);
    if(document.status !== 'disabled') ctx.throw(400, `ID为${document._id}的回复未被屏蔽，请刷新`);
    const {normal: normalStatus} = await db.DocumentModel.getDocumentStatus();
    //更新document的状态
    await document.setStatus(normalStatus);
    await next();
  })
  .get('/:_id/options', async (ctx, next) => {
    const {db, data, state, params, query, permission} = ctx;
    const {_id} = params;
    const {aid} = query;
    const {user} = data;
    const {uid} = state;
    const {stable: stableType} = await db.DocumentModel.getDocumentTypes();
    const {comment: commentSource} = await db.DocumentModel.getDocumentSources();
    const comment = await db.CommentModel.findOnly({_id});
    const document = await db.DocumentModel.findOnly({did: comment.did, type: stableType});
    if(!comment || !document) return ctx.throw(400, '未找到评论，请刷新后重试');
    const isComment = document.source === commentSource;
    const optionStatus = {
      anonymous: null,
      anonymousUser: null,
      disabled: null,
      complaint: null,
      reviewed: null,
      editor: null,
      ipInfo: null,
      violation: null,
      blacklist: null,
    };
    if(user) {
      if(isComment) {
        //审核权限
        if(permission('review')) {
          optionStatus.reviewed = document.status
        }
        //用户具有自己的评论的编辑权限
        if(uid === comment.uid) {
          optionStatus.editor = true;
        }
        //退修禁用权限
        optionStatus.disabled = (
          (ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft'))
        )? true: null;
        //投诉权限
        optionStatus.complaint = permission('complaintPost')?true:null;
        //查看IP
        optionStatus.ipInfo = ctx.permission('ipinfo')? document.ip : null;
        // 未匿名
        if(!document.anonymous) {
          if(user.uid !== comment.uid) {
            // 黑名单
            optionStatus.blacklist = await db.BlacklistModel.checkUser(user.uid, comment.uid);
          }
          // 违规记录
          optionStatus.violation = ctx.permission('violationRecord')? true: null;
          data.commentUserId = comment.uid;
        }
      }
    }
    data.options = optionStatus;
    data.toc = document.toc;
    await next();
  })
  .get('/:_id/ipInfo', async (ctx, next) => {
    const {db, data, params, query, address} = ctx;
    const {_id} = params;
    let comment = await db.CommentModel.findOnly({_id});
    if(!comment) ctx.throw(404, '未找到评论,请刷新后重试')
    const {stable: stableType} = await db.DocumentModel.getDocumentTypes();
    const comments = await db.CommentModel.extendDocumentOfComment([comment], stableType, [
        '_id',
        'ip',
        'port'
      ]);
    let ip = comments[0].document.ip;
    const realIp = await db.IPModel.getIPByToken(ip);
    if(realIp)  ip = realIp;
    const targetIp = ip || address;
    data.ipInfo = await db.IPModel.getIPInfoFromLocal(targetIp);
    await next();
  })
module.exports = router;
