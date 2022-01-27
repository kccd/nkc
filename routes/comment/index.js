const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    //获取该图书下的全部评论和用户编辑框中未发布的内容
    const {db, data, state, query, permission} = ctx;
    const {sid} = query;
    let comments = await db.CommentModel.find({sid, source: 'comment'}).sort({toc: 1});
    let comment = await db.CommentModel.findOne({uid: state.uid, source: 'comment'}).sort({toc: -1}).limit(1);
    comments = await db.CommentModel.extendBookComments(comments);
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
    data.comment = comment;
    data.comments = comments;
    await next();
  })
  .get('/:_id/quote', async (ctx, next) => {
    //获取引用数据
    const {db, data, params, query, nkcModules} = ctx;
    const {_id} = params;
    let comment = await db.CommentModel.findOne({source: 'comment', _id});
    if(!comment) ctx.throw(400, '未找到该评论，请刷新后重试');
    const document = await db.DocumentModel.findOne({did: comment.did, type: 'stable', status: 'normal'});
    if(!document) ctx.throw(400, '未找到该评论，请刷新后重试');
    comment = await db.CommentModel.extendBookComments([comment]);
    const {order, _id: commentId, uid, user, did, sid, source} = comment[0];
    data.quote = {
      _id: commentId,
      order,
      comment: comment[0],
      uid,
      user,
      did,
      sid,
      source,
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
      quoteCid,
      type,
      commentId
    } = body;
    if(!['modify', 'publish', 'create', 'save'].includes(type)) ctx.throw(400, `未知的提交类型 type: ${type}`);
    let comment;
    if(type === 'create') {
      comment = await db.CommentModel.createComment({
        uid: state.uid,
        content,
        quoteCid,
        source,
        sid,
        ip: ctx.address,
        port: ctx.port
      });
    } else {
      comment = await db.CommentModel.findOne({_id: commentId});
      await comment.modifyComment({
        content
      });
      if(type === 'publish') {
        const lock = await nkcModules.redLock.lock(comment._id, 6000);
        await comment.publishComment();
        await comment.updateOrder();
        await lock.unlock();
      } else if(type === 'save') {
        await comment.saveComment()
      }
    }
    data.commentId = comment._id;
    await next();
  })
  .post('/:_id/disabled', async (ctx, next) => {
    //评论退修或禁用
    const {db, data, params, permission, body} = ctx;
    const {_id} = params;
    const {type: status, remindUser, violation, reason} = body;
    if(!['faulty', 'disabled'].includes(status)) ctx.throw(401, '错误类型');
    if(!permission('disabledComment')) ctx.throw(403, '权限不足');
    const comment = await db.CommentModel.findOne({_id});
    if(!comment) ctx.throw(401, '未找到评论， 请刷新后重试！');
    const document = await db.DocumentModel.findOne({did: comment.did, type: 'stable', status: 'normal'});
    const targetUser = await db.UserModel.findOne({uid: document.uid});
    await document.updateOne({
      $set: {
        status,
      }
    });
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
module.exports = router;
