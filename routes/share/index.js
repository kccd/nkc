const Router = require('koa-router');
const shareRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
shareRouter
  .get('/:token', async (ctx) => {
    const {params, db, data, nkcModules} = ctx;
    const {token} = params;
    const {user} = data;
    const share = await db.ShareModel.findOne({token});
    if(!share) ctx.throw(403, '无效的token');
    const {kcbTotal, uid, tokenType} = share;
    let shareUrl;
    if(share.shareUrl.includes("?")) {
      shareUrl = share.shareUrl + '&token=' + token;
    } else {
      shareUrl = share.shareUrl + '?token=' + token;
    }
    await share.update({$inc: {hits: 1}});
    let shareAccessLog = await db.SharesAccessLogModel.findOne({token, ip: ctx.address});
    if(shareAccessLog) {
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));
    } else {
      shareAccessLog = db.SharesAccessLogModel({
        ip: ctx.address,
        port: ctx.port,
        token,
        uid: user?user.uid: ''
      });
      await shareAccessLog.save();
    }
    // 若分享者是游客
    if(['', 'visitor'].includes(uid)) return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));
    const targetUser = await db.UserModel.findOnly({uid});
    // 若该ip已经访问过则不给予分享着奖励
    // 不属于站外的用户（已经登录的用户）访问时不给予分享者奖励
    if(user) return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));
    try{
      // 判断token是否有效
      await db.ShareModel.ensureEffective(token);
    } catch(err) {
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));
    }
    // 若share有效则写入cookie
    ctx.cookies.set('share-token', token, {
      httpOnly: true,
      signed: true
    });
    if(!share.shareReward) return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));// 若share分享奖励无效则不给予分享着奖励
    const redEnvelopeSettings = await db.SettingModel.findOnly({_id: 'redEnvelope'});
    const shareSettings = redEnvelopeSettings.c.share[share.tokenType];
    if(!shareSettings.status) return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl)); // 已关闭
    if(shareSettings.maxKcb <= kcbTotal) return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl)); // 若分享者获得的奖励大于等于奖励设置的最大值则不再给予新的奖励
    const {kcb, maxKcb} = shareSettings;
    let addKcb; // 奖励的kcb值
    if(kcb + kcbTotal > maxKcb) {
      addKcb = maxKcb - kcbTotal;
    } else {
      addKcb = kcb;
    }
    if(addKcb <= 0) return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl)); // 获得的奖励已经超过最大值
    // 判断分享的是什么类容
    const shareLimit = await db.ShareLimitModel.findOnly({shareType: tokenType});
    // 写入kcb交易记录
    const record = db.KcbsRecordModel({
      _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
      from: 'bank',
      to: targetUser.uid,
      num: addKcb,
      type: 'share',
      shareToken: token,
      c: {
        type: tokenType,
        token
      },
      ip: ctx.address,
      port: ctx.port,
      description: `分享${shareLimit.shareName}`
    });
    await record.save();

    // 计算分享者的kcb
    targetUser.kcb = await db.UserModel.updateUserKcb(targetUser.uid);
    // 更新分享者以获得的kcb总数
    await share.update({
      $inc: {
        kcbTotal: addKcb
      }
    });
    // 将分享者获得的kcb写入当前用户访问的记录上
    await shareAccessLog.update({kcb: addKcb});

    return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));

  })
.post('/', async (ctx, next) => {
  const {data, body, db, nkcModules} = ctx;
  const {ShareModel} = db;
  const {str, type, targetId} = body;
  const {user} = data;
  let uid;
  if(user){
    uid = user.uid
  }else{
    uid = "visitor";
  }
  // 生成token：4位随机码+自增shareId
  const token = apiFn.makeRandomCode(8);
  let toKenFromDB, n = 100;
  do{
    n--;
    if(n < 0) ctx.throw(500, '获取token出错');
    toKenFromDB = await db.ShareModel.findOne({token});
  } while(toKenFromDB && toKenFromDB.token === token);
  const today = nkcModules.apiFunction.today();
  const shareCount = await db.ShareModel.count({toc: {$gte: today}});
  const shareCountByType = await db.ShareModel.count({toc: {$gte: today}, tokenType: type});
  let shareReward = true, registerReward = true;
  const redEnvelopeSettings = await db.SettingModel.findOnly({_id: 'redEnvelope'});
  const shareSettings = redEnvelopeSettings.c.share;
  if(!shareSettings.register.status) registerReward = false;
  if(!shareSettings[type].status) shareReward = false;
  if(shareSettings.register.count <= shareCount) registerReward = false;
  if(shareSettings[type].count <= shareCountByType) shareReward = false;
  const shareInfo = new ShareModel({
    token: token,
    tokenType: type,
    shareUrl: str,
    uid: uid,
    targetId,
    registerReward,
    shareReward
  });
  await shareInfo.save();
  const sharesAccessLog = db.SharesAccessLogModel({
    ip: ctx.address,
    port: ctx.port,
    token,
    uid
  });
  await sharesAccessLog.save();
  data.newUrl = "/s/" + token;
  await next();
});
module.exports = shareRouter;