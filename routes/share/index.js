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
    const lock = await nkcModules.redLock.lock(`share:${token}`, 6000);
    const {uid, tokenType} = share;
    // 这里可以取到uid,id,toc,machine,ip, port,shareType,code,originUrl,type
    // kcd先默认为0，如果有kcb奖励则在下方update
    // 写入操作日志
    const shareLogs = db.ShareLogsModel({
      id: await db.SettingModel.operateSystemID('shareLogs', 1),
      uid: user ? user.uid : "visitor",
      shareUid: share.uid,
      machine: ctx.get("User-Agent"),
      referer: ctx.get("referer"),
      ip: ctx.address,
      port: ctx.port,
      shareType: tokenType,
      code: token,
      originUrl: share.shareUrl,
      type: "cli"
    });
    await shareLogs.save();

    let shareUrl;
    if(share.shareUrl.includes("?")) {
      shareUrl = share.shareUrl + '&token=' + token;
    } else {
      shareUrl = share.shareUrl + '?token=' + token;
    }
    await share.update({$inc: {hits: 1}});
    let shareAccessLog = await db.SharesAccessLogModel.findOne({token, ip: ctx.address});
    if(shareAccessLog) {
      await lock.unlock();
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
    if(['', 'visitor'].includes(uid)) {
      await lock.unlock();
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));
    }
    const targetUser = await db.UserModel.findOnly({uid});
    // 若该ip已经访问过则不给予分享着奖励
    // 不属于站外的用户（已经登录的用户）访问时不给予分享者奖励
    if(user) {
      await lock.unlock();
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));
    }
    try{
      // 判断token是否有效
      await db.ShareModel.ensureEffective(token);
    } catch(err) {
      await lock.unlock();
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, shareUrl));
    }
    // 若share有效则写入cookie
    ctx.setCookie(`share-token`, token);
    // 给予奖励
    const {status, num} = await share.computeReword("visit", ctx.address, ctx.port);
    // 计算分享者的kcb
    targetUser.kcb = await db.UserModel.updateUserKcb(targetUser.uid);
    // 将分享者获得的kcb写入当前用户访问的记录上
    if(status) {
      await shareLogs.update({kcb: num});
    }
    await lock.unlock();
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
  // 若分享的是forum、thread或post则需验证权限
  if(type === "thread") {
    const thread = await db.ThreadModel.findOnly({tid: targetId});
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
  } else if(type === "post") {
    const post = await db.PostModel.findOnly({pid: targetId});
    const thread = await post.extendThread();
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
  } else if(type === "forum") {
    const forum = await db.ForumModel.findOnly({fid: targetId});
    await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
  }
  // 加载奖励设置，判断当天分享次数是否达到上限
  const redEnvelopeSettings = await db.SettingModel.getSettings("redEnvelope");
  const shareSettings = redEnvelopeSettings.share;
  let share = {
    tokenType: type,
    shareUrl: str,
    uid: uid,
    targetId
  };
  const {count} = shareSettings[type];
  if(!user) {
    share.shareReward = false;
    share.registerReward = false;
  } else {
    const today = nkcModules.apiFunction.today();
    const shareCountByType = await db.ShareModel.count({uid: user.uid, toc: {$gte: today}, tokenType: type});
    // 若此类型今日分享次数已达上限则不给予分享者奖励
    if(shareCountByType >= count) share.shareReward = false;
  }
  // 生成token
  let token, n = 0;
  do{
    n++;
    if(n > 100) ctx.throw(500, '生成唯一token失败');
    token = apiFn.getRandomString("a0", 8);
    const tokenCount = await db.ShareModel.count({token});
    if(!tokenCount) break;
  } while(1);
  share.token = token;
  const shareInfo = new ShareModel(share);
  const sharesAccessLog = db.SharesAccessLogModel({
    ip: ctx.address,
    port: ctx.port,
    token,
    uid
  });
  await shareInfo.save();
  await sharesAccessLog.save();
  const shareLogs = db.ShareLogsModel({
    id: await db.SettingModel.operateSystemID('shareLogs', 1),
    uid: user ? user.uid : "visitor",
    shareUid: share.uid,
    machine: ctx.get("User-Agent"),
    referer: ctx.get("referer"),
    ip: ctx.address,
    port: ctx.port,
    shareType: type,
    code: token,
    originUrl: str,
    type: "spo"
  });
  await shareLogs.save();
  data.newUrl = "/s/" + token;
  await next();
});
module.exports = shareRouter;