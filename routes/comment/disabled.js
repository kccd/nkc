module.exports = async (ctx, next) => {
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
  let review = await db.ReviewModel.findOne({sid: document._id,source:'document'}).sort({toc: -1}).limit(1);
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
};
