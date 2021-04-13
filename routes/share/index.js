const Router = require('koa-router');
const shareRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
const serverConfig = require("../../config/server");
const reg = new RegExp(`^` +
  serverConfig.domain
    .replace(/\//g, "\\/")
    .replace(/\./g, "\\.")
  , "i");
shareRouter
  .get('/:token', async (ctx) => {
    const {params, db, data, nkcModules} = ctx;
    const {token} = params;
    const {user} = data;
    const lock = await nkcModules.redLock.lock(`share:${token}`, 6000);
    const share = await db.ShareModel.findOne({token});
    if(!share) {
      await lock.unlock();
      ctx.throw(403, '无效的token');
    }
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
    await share.updateOne({$inc: {hits: 1}});
    let shareAccessLog = await db.SharesAccessLogModel.findOne({token, ip: ctx.address});
    if(shareAccessLog) {
      await lock.unlock();
      return ctx.redirect(shareUrl);
    } else {
      shareAccessLog = db.SharesAccessLogModel({
        ip: ctx.address,
        port: ctx.port,
        token,
        uid: user?user.uid: ''
      });
      await shareAccessLog.save();
    }
    // 点击本站内的分享链接不给予奖励
    const referer = ctx.get("referer");
    if(referer && reg.test(referer)) {
      await lock.unlock();
      return ctx.redirect(shareUrl);
    }
    // 若分享者是游客
    if(['', 'visitor'].includes(uid)) {
      await lock.unlock();
      return ctx.redirect(shareUrl);
    }
    // 若该ip已经访问过则不给予分享着奖励
    // 不属于站外的用户（已经登录的用户）访问时不给予分享者奖励
    if(user) {
      await lock.unlock();
      return ctx.redirect(shareUrl);
    }
    try{
      // 判断token是否有效
      await db.ShareModel.ensureEffective(token);
    } catch(err) {
      await lock.unlock();
      return ctx.redirect(shareUrl);
    }
    // 若share有效则写入cookie
    ctx.setCookie(`share-token`, {token});
    // 给予奖励
    const {status, num} = await share.computeReword("visit", ctx.address, ctx.port);
    // 计算分享者的kcb
    // targetUser.kcb = await db.UserModel.updateUserKcb(targetUser.uid);
    // 将分享者获得的kcb写入当前用户访问的记录上
    if(status) {
      await shareLogs.updateOne({kcb: num});
    }
    await lock.unlock();
    return ctx.redirect(shareUrl);
  })
  .get('/', async (ctx, next) => {
    const {query, db, data, nkcModules} = ctx;
    const {type, id} = query;
    const {user} = data;
    const uid = user? user.uid: 'visitor';
    const lock = await nkcModules.redLock.lock(`getShareToken:${uid}`, 6000);
    const result = {};
    if(type === 'post') {
      const post = await db.PostModel.findOnly({pid: id});
      const thread = await post.extendThread();
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      const firstPost = await db.PostModel.findOnly({pid: thread.oc}, {t: 1, cover: 1});
      if(!post.t) {
        result.title = firstPost.t;
      } else {
        result.title = post.t;
      }
      result.description = nkcModules.nkcRender.htmlToPlain(post.c, 100);
      result.cover = post.cover || firstPost.cover;
      if(result.cover) {
        result.cover = nkcModules.tools.getUrl('postCover', result.cover);
      }
    } else if(type === 'thread') {
      const thread = await db.ThreadModel.findOnly({tid: id});
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
      const firstPost = await db.PostModel.findOnly({pid: thread.oc}, {t: 1, cover: 1});
      result.title = firstPost.t;
      result.description = nkcModules.nkcRender.htmlToPlain(firstPost.c, 100);
      result.cover = firstPost.cover;
      if(result.cover) {
        result.cover = nkcModules.tools.getUrl('postCover', result.cover);
      }
    } else if(type === 'forum') {
      const forum = await db.ForumModel.findOnly({fid: id});
      await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
      result.title = forum.displayName;
      result.description = forum.description;
      result.cover = forum.logo;
      if(result.cover) {
        result.cover = nkcModules.tools.getUrl('forumLogo', result.cover);
      }
    }
    const referer = ctx.get('referer');
    // 加载奖励设置，判断当天分享次数是否达到上限
    const redEnvelopeSettings = await db.SettingModel.getSettings('redEnvelope');
    const shareSettings = redEnvelopeSettings.share;
    let share = {
      tokenType: type,
      shareUrl: referer,
      uid,
      targetId: id,
    }
    const {count} = shareSettings[type];
    if(!user) {
      share.shareReward = false;
      share.registerReward = false;
    } else {
      const today = nkcModules.apiFunction.today();
      const shareCountByType = await db.ShareModel.countDocuments({
        uid: user.uid,
        toc: {
          $gte: today
        },
        tokenType: type
      });
      if(shareCountByType >= count) share.shareReward = false;
    }
    let token;
    try{
      token = await db.ShareModel.getNewToken();
    } catch(err) {
      await lock.unlock();
      throw err;
    }
    share.token = token;
    const shareInfo = new db.ShareModel(share);
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
      uid,
      shareUid: share.uid,
      machine: ctx.get("User-Agent"),
      referer: ctx.get("referer"),
      ip: ctx.address,
      port: ctx.port,
      shareType: type,
      code: token,
      originUrl: referer,
      type: "spo"
    });
    await shareLogs.save();
    if(!result.cover) {
      result.cover = nkcModules.tools.getUrl('defaultFile', 'logo3.png');
    }
    result.url = `/s/${token}`
    data.result = result;
    await lock.unlock();
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, body, db, nkcModules, state} = ctx;
    const {ShareModel} = db;
    let {str, type, targetId} = body;
    const {user} = data;
    const lock = await nkcModules.redLock.lock(`getShareToken:${user?user.uid:'visitor'}`, 6000);
    let uid;
    if(user){
      uid = user.uid
    }else{
      uid = "visitor";
    }
    // 如果targetId不存在，则从url中获取
    if(!targetId && (type === "thread" || type === "post" || type === "forum")) {
      str.replace(/\/[tfp]\/([0-9]+)/ig, (c, v1) => {
        targetId = v1;
      });
      /*let delParamUrl = str.replace("?", "");
      let routerArr = delParamUrl.split("/");
      targetId = routerArr[routerArr.length-1]*/
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
    } else {
      data.newUrl = str;
      await lock.unlock();
      return await next();
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
      const shareCountByType = await db.ShareModel.countDocuments({uid: user.uid, toc: {$gte: today}, tokenType: type});
      // 若此类型今日分享次数已达上限则不给予分享者奖励
      if(shareCountByType >= count) share.shareReward = false;
    }
    // 生成token
    let token;
    try{
      token = await db.ShareModel.getNewToken();
    } catch(err) {
      await lock.unlock();
      ctx.throw(500, err.message);
    }
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
    data.logoUrl = nkcModules.tools.getUrl('siteIcon', state.serverSettings.siteIcon);
    await lock.unlock();
    await next();
  });
module.exports = shareRouter;
