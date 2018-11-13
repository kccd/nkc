const Router = require('koa-router');
const shareRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
shareRouter
.use('/', async (ctx, next) => {
  const {data, db} = ctx;
  await next();
})
.get('/:token', async (ctx, next) => {
  const {params, data, body, db} = ctx;
  const {token} = params;
  // 检测token是否存在
  let share = await db.ShareModel.findOne({"token":token});
  if(!share) ctx.throw(404, "链接有误");
  // 检测token是否有效
  if(share.tokenLife == "invalid") ctx.throw(404, "链接已失效");
  // 检测token是否已过期
  // 取出token生成日期
  let shareLimit = await db.ShareModel.findOne({"shareType":"all"});
  if(!shareLimit){
    shareLimit = new db.ShareLimitModel({});
    await shareLimit.save();
  }
  let shareTimeStamp = parseInt(new Date(share.toc).getTime());
  let nowTimeStamp = parseInt(new Date().getTime());
  if(nowTimeStamp - shareTimeStamp > 1000*60*60*shareLimit.shareLimitTime){
    await db.ShareModel.update({"token": token}, {$set: {tokenLife: "invalid"}});
    return ctx.throw(404, "链接已过期");
  }
  if(!share.ips.includes(ctx.ip)){
    share.ips.push(ctx.ip);
    await share.save()
  }
  let {shareUrl} = share;
  shareUrl = shareUrl + "?token=" + token
  return ctx.redirect(shareUrl)
  await next();
})
.post('/', async (ctx, next) => {
  const {query, data, body, db} = ctx;
  const {ShareModel} = db;
  const {str, type} = body;
  const {user} = data;
  let uid;
  if(user){
    uid = user.uid
  }else{
    uid = "visitor";
  }
  // 生成token：4位随机码+自增shareId
  const shareId = await db.SettingModel.operateSystemID('shares', 1);
  let token = apiFn.makeRandomCode(8);
  // token += shareId;
  const shareInfo = new ShareModel({
    token: token,
    tokenType: type,
    shareUrl: str,
    uid: uid
  });
  await shareInfo.save();
  let newUrl = "/share/" + token;
  data.newUrl = newUrl;
  await next();
})
module.exports = shareRouter;