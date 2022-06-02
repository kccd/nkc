const router = require('koa-router')();

router
  .post('/', async (ctx, next) => {
    //独立文章加精
    const {db, data, query, params, state, permission, nkcModules, body} = ctx;
    const {aid} = params;
    const {kcb} = body;
    if(!permission('digestArticle')) return ctx.throw(401, '权限不足');
    const digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
    const article = await db.ArticleModel.findOnly({_id: aid});
    if(!article) return ctx.throw(404, '未找到文章，请刷新后重试');
    const _article = (await db.ArticleModel.getArticlesInfo([article]))[0];
    data.article = _article;
    const targetUser = await db.UserModel.findOnly({uid: article.uid});
    data.targetUser = targetUser;
    const redEnvelopeSetting = await db.SettingModel.findOnly({_id: 'redEnvelope'});
    let num;
    if(!redEnvelopeSetting.c.draftFee.close) {
      if(!kcb) ctx.throw(400, '参数错误， 请刷新');
      num = Number(kcb);
      if(num%1 !== 0) ctx.throw(400, `${digestRewardScore.name}仅支持到小数点后两位`);
      if(!redEnvelopeSetting.c.draftFee.close && (num < redEnvelopeSetting.c.draftFee.minCount || num > redEnvelopeSetting.c.draftFee.maxCount)) ctx.throw(400, `${digestRewardScore.name}数额不在范围内`);
    }
  
    const usersGeneralSettings = await db.UsersGeneralModel.findOnly({uid: _article.user.uid});
    
    if(article.digest) ctx.throw(400, '文章已被加精');
    const digestTime = Date.now();
    article.digest = true;
    await article.updateOne({digest: true, digestTime});
    const log = {
        user: targetUser,
        type: 'kcb',
        typeIdOfScoreChange: 'digestArticle',
        port: ctx.port,
        pid: article._id,
        ip: ctx.address,
    };
    let message;
    const messageId = await db.SettingModel.operateSystemID('messages', 1);
    if(!redEnvelopeSetting.c.draftFee.close) {
        const record = db.KcbsRecordModel({
            _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
            from: 'bank',
            scoreType: digestRewardScore.type,
            type: 'digestArticle',
            to: targetUser.uid,
            toc: digestTime,
            port: ctx.port,
            ip: ctx.address,
            description: '',
            num,
            pid: article._id,
        });
        await record.save();
    }
    // await db.KcbsRecordModel.insertSystemRecord('digestArticle', targetUser, ctx);
    log.type = 'score';
    log.key = 'digestArticleCount';
    await db.UsersScoreLogModel.insertLog(log);
    message = db.MessageModel({
        _id: messageId,
        ty: 'STU',
        r: targetUser.uid,
        vd: false,
        c: {
            type: 'digestArticle',
            targetUid: targetUser.uid,
            aid: article.id,
        },
    });
    await message.save();
    if(!redEnvelopeSetting.c.draftFee.close) {
        await usersGeneralSettings.updateOne({$inc: {'draftFeeSettings.kcb': num}});
    }
    await nkcModules.socket.sendMessageToUser(message._id);
    // 更新用户科创币
    data.targetUser.kcb = await db.UserModel.updateUserKcb(data.targetUser.uid);
    // 更新用户积分
    data.userScores = await db.UserModel.updateUserScores(targetUser.uid);
    await next();
  })
  .del('/', async (ctx, next) => {
    const {db, data, params, permission} = ctx;
    const {aid} = params;
    if(!permission('unDigestArticle')) ctx.throw(401, '权限不足');
    const article = await db.ArticleModel.findOnly({_id: aid});
    if(!article) ctx.throw(404, '为找到文章，请刷新后重试');
    const _article = (await db.ArticleModel.getArticlesInfo([article]))[0];
    const targetUser = await db.UserModel.findOnly({uid: article.uid});
    data.targetUser = targetUser;
    data.article = _article;
    if(!article.digest) ctx.throw(400, '文章未被加精，请刷新后重试');
    let additionalReward = 0;
    const rewardLog = await db.KcbsRecordModel.findOne({type: 'digestArticle', pid: aid}).sort({toc: -1});
    if(rewardLog) {
    additionalReward = 0 - rewardLog.num;
    }
    const redEnvelopeSetting = await db.SettingModel.findOnly({_id: 'redEnvelope'});
    const digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
    article.digest = false;
    const digestTime = Date.now();
    await article.updateOne({digest: false, digestTime});
    // 扣除科创币
    if(!redEnvelopeSetting.c.draftFee.close) {
      const record = db.KcbsRecordModel({
        _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
        from: 'bank',
        scoreType: digestRewardScore.type,
        type: 'unDigestArticle',
        to: targetUser.uid,
        toc: digestTime,
        port: ctx.port,
        ip: ctx.address,
        description: '',
        num: additionalReward,
        pid: article._id,
      });
      await record.save();
    }
    const log = {
    user: targetUser,
    type: 'kcb',
    typeIdOfScoreChange: 'unDigestArticle',
    port: ctx.port,
    pid: aid,
    ip: ctx.address,
    };
    // await db.KcbsRecordModel.insertSystemRecord('unDigestArticle', data.targetUser, ctx, additionalReward);
    log.type = 'score';
    log.change = -1;
    log.key = 'digestArticleCount';
    await db.UsersScoreLogModel.insertLog(log);
    // 更新用户科创币
    data.targetUser.kcb = await db.UserModel.updateUserKcb(data.targetUser.uid);
    // 更新用户积分
    data.userScores = await db.UserModel.updateUserScores(targetUser.uid);
    await next();
  })

module.exports = router;
