const router = require('koa-router')();

router
  .post('/xsf', async (ctx, next) => {
    const {db, data, params, permission, body} = ctx;
    const {aid} = params;
    const {user} = data;
    let {num, description} = body;
    num = Number(num)
    if(num % 1 !==0) ctx.throw(400, '学术分仅支持整数加减');
    if(!permission('creditXsf')) ctx.throw(403, '权限不足');
    const article = await db.ArticleModel.findOnly({_id: aid});
    const {normal} = await db.ArticleModel.getArticleStatus();
    if(article.status !== normal) ctx.throw(403, '无法给状态不正常的评论加减学术分');
    const targetUser = await db.UserModel.findOnly({uid: article.uid});
    if(targetUser.uid === user.uid) ctx.throw(403, '不允许给自己加减学术分');
    const xsfSettings = await db.SettingModel.findOnly({_id: 'xsf'});
    const {addLimit, reduceLimit} = xsfSettings.c;
    if(num === 0) ctx.throw(400, '分值无效');
    if(num < 0 && -1*num > reduceLimit) ctx.throw(400, `单次扣除不能超过${reduceLimit}学术分`);
    if(num > 0 && num > addLimit) ctx.throw(400, `单次添加不能超过${addLimit}学术分`);
    if(description.length < 2) ctx.throw(400, '理由写的太少了');
    if(description.length > 500) ctx.throw(400, '理由不能超过500个字');
    const _id = await db.SettingModel.operateSystemID('xsfsRecords', 1);
    const newRecord = db.XsfsRecordModel({
      _id,
      uid: targetUser.uid,
      operatorId: user.uid,
      num,
      description,
      ip: ctx.address,
      port: ctx.port,
      pid: aid,
      recordType: 'article',
    });
    targetUser.xsf += num;
    await newRecord.save();
    try{
      await targetUser.save();
    } catch(err) {
      await newRecord.deleteOne();
      throw(err);
    }
    await targetUser.calculateScore();
    const message = db.MessageModel({
      _id: await db.SettingModel.operateSystemID('messages', 1),
      r: targetUser.uid,
      ty: 'STU',
      port: ctx.port,
      ip: ctx.address,
      c: {
        type: 'xsf',
        aid,
        num,
        description
      }
    });
    await message.save();
    await ctx.nkcModules.socket.sendMessageToUser(message._id);
    await next();
  })

module.exports = router;
