const router = require('koa-router')();

router
  .post('/', async (ctx, next) => {
    //评论加精，加精奖励科创币
    const {data, db, body, permission, params, nkcModules} = ctx;
    const {user} = data;
    const {_id: cid} = params;
    const {kcb} = body;
    if(!permission('digestComment')) ctx.throw(401, '权限不足');
    const digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
    const comment = await db.CommentModel.findOnly({_id: cid});
    if(!comment) ctx.throw(404, '为找到评论， 请刷新后重试');
    data.comment = (await db.CommentModel.getCommentsByCommentsId([comment._id]))[0];
    const targetUser = await db.UserModel.findOnly({uid: comment.uid});
    data.targetUser = targetUser;
    const redEnvelopeSetting = await db.SettingModel.findOnly({_id: 'redEnvelope'});
    let num;
    if(!redEnvelopeSetting.c.draftFee.close) {
      if(!kcb) ctx.throw(400, '参数错误， 请刷新');
      num = Number(kcb);
      if(num%1 !== 0) ctx.throw(400, `${digestRewardScore.name}仅支持到小数点后两位`);
      if(!redEnvelopeSetting.c.draftFee.close && (num < redEnvelopeSetting.c.draftFee.minCount || num > redEnvelopeSetting.c.draftFee.maxCount)) ctx.throw(400, `${digestRewardScore.name}数额不在范围内`);
    }
    const usersGeneralSettings = await db.UsersGeneralModel.findOnly({uid: comment.uid});
    if(comment.digest) ctx.throw(400, '评论已被加精');
    const digestTime = Date.now();
    comment.digest = true;
    await comment.updateOne({digest: true, digestTime});
    const log = {
      user: targetUser,
      type: 'kcb',
      typeIdOfScoreChange: 'digestComment',
      port: ctx.port,
      pid: comment._id,
      ip: ctx.address,
    };
    let message;
    const messageId = await db.SettingModel.operateSystemID('messages', 1);
    if(!redEnvelopeSetting.c.draftFee.close) {
      const record = db.KcbsRecordModel({
        _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
        from: 'bank',
        scoreType: digestRewardScore.type,
        type: 'digestComment',
        to: targetUser.uid,
        toc: digestTime,
        port: ctx.port,
        ip: ctx.address,
        description: '',
        num,
        commentId: comment._id,
      });
      await record.save();
    }
    log.type = 'score';
    log.key = 'digestCommentCount';
    await db.UsersScoreLogModel.insertLog(log);
    message = db.MessageModel({
      _id: messageId,
      ty: 'STU',
      r: targetUser.uid,
      vd: false,
      c: {
        type: 'digestComment',
        targetUid: targetUser.uid,
        cid: comment.id,
      },
    });
    await message.save();
    if(!redEnvelopeSetting.c.draftFee.close) {
      await usersGeneralSettings.updateOne({$inc: {'draftFeeSettings.kcb': num}});
    }
    await nkcModules.socket.sendMessageToUser(message._id);
    //更新用户科创币
    data.targetUser.kcb = await db.UserModel.updateUserKcb(data.targetUser.uid);
    //更新用户积分
    data.userScores = await db.UserModel.updateUserScores(targetUser.uid);
    await next();
  })
  .del('/', async (ctx, next) => {
    //评论取消加精，取消加精后扣除科创币
    const {data, params, permission, db} = ctx;
    const {_id: cid} = params;
    if(!permission('unDigestComment')) ctx.throw(401, '权限不足');
    const comment = await db.CommentModel.findOnly({_id: cid});
    if(!comment) ctx.throw(404, '未找到评论， 请刷新后重试');
    data.comment = (await db.CommentModel.getCommentsByCommentsId([comment._id]))[0];
    const redEnvelopeSetting = await db.SettingModel.findOnly({_id: 'redEnvelope'});
    const digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
    const targetUser = await db.UserModel.findOnly({uid: comment.uid});
    data.targetUser = targetUser;
    if(!comment.digest) ctx.throw(400, '文章未被加精，请刷新后重试');
    let additionalReward = 0;
    const rewardLog = await db.KcbsRecordModel.findOne({type: 'digestComment', pid: cid}).sort({toc: -1});
    if(rewardLog) {
      additionalReward = 0 - rewardLog.num;
    }
    const digestTime = Date.now();
    comment.digest = false;
    await comment.updateOne({digest: false, digestTime});
    // 扣除科创币
    if(!redEnvelopeSetting.c.draftFee.close) {
      const record = db.KcbsRecordModel({
        _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
        from: targetUser.uid,
        scoreType: digestRewardScore.type,
        type: 'unDigestComment',
        to: 'bank',
        toc: digestTime,
        port: ctx.port,
        ip: ctx.address,
        description: '',
        num: additionalReward,
        commentId: comment._id,
      });
      await record.save();
    }
    const log = {
      user: targetUser,
      type: 'kcb',
      typeIdOfScoreChange: 'unDigestComment',
      port: ctx.port,
      pid: cid,
      ip: ctx.address,
    };
    log.type = 'score';
    log.change = -1;
    log.key = 'digestCommentCount';
    await db.UsersScoreLogModel.insertLog(log);
    // 更新用户科创币
    await db.UserModel.updateUserKcb(data.targetUser.uid);
    // 更新用户积分
    data.userScores = await db.UserModel.updateUserScores(targetUser.uid);
    await next();
  })

module.exports = router;
