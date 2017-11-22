const Router = require('koa-router');
const subscribeRouter = new Router();
const nkcModules = require('../../nkcModules');
const apiFn = nkcModules.apiFunction;
subscribeRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    let {fans, page} = ctx.query;
    page = page || 0;
    const {uid} = ctx.params;
    const targetUser = await db.UserModel.findOnly({uid});
    const targetUserSubscribe = await db.UserSubscribeModel.findOnly({uid});
    let targetUid = [];
    if(fans) {
      targetUid = targetUserSubscribe.subscribers;
      data.fans = true;
    }
    else targetUid = targetUserSubscribe.subscribeUsers;
    const paging = apiFn.paging(page, targetUid.length);
    targetUid = targetUid.slice(paging.start, paging.start + paging.perpage);
    let targetUsers = await Promise.all(targetUid.map(async uid => await db.UserModel.findOnly({uid})));
    data.targetUser = targetUser;
    data.targetUsers = targetUsers;
    data.paging = paging;
    ctx.template = 'interface_subscribe.pug';
    await next();
  })
  // 关注该用户
  .post('/', async (ctx, next) => {
    let {uid} = ctx.params;
    if(!uid) ctx.throw(400, '参数不正确');
    let {db} = ctx;
    let {user} = ctx.data;
    if(user.uid === uid) ctx.throw(400, '关注自己干嘛？');
    let subscribersOfDB = await db.UserSubscribeModel.findOneAndUpdate({uid: uid}, {$addToSet: {subscribers: user.uid}});
    let subscribeUsersOfDB = await db.UserSubscribeModel.findOneAndUpdate({uid: user.uid}, {$addToSet: {subscribeUsers: uid}});
    if(subscribersOfDB.subscribers.indexOf(user.uid) > -1 && subscribeUsersOfDB.subscribeUsers.indexOf(uid) > -1) ctx.throw(400, '您之前已经关注过该用户了，没有必要重新关注');
    ctx.data.message = `关注 uid:${uid} 成功`;
    await next();
  })
  // 取消关注该用户
  .del('/', async (ctx, next) => {
    let {uid} = ctx.params;
    if(!uid) ctx.throw(400, '参数不正确');
    let {db} = ctx;
    let {user} = ctx.data;
    let subscribersOfDB = await db.UserSubscribeModel.findOneAndUpdate({uid: uid}, {$pull: {subscribers: user.uid}});
    let subscribeUsersOfDB = await db.UserSubscribeModel.findOneAndUpdate({uid: user.uid}, {$pull: {subscribeUsers: uid}});
    if(subscribersOfDB.subscribers.indexOf(user.uid) === -1 && subscribeUsersOfDB.subscribers.indexOf(uid) === -1) ctx.throw(400, '您之前没有关注过该用户，操作无效');
    ctx.data.message = `取消关注 uid:${uid} 成功`;
    await next();
  });

module.exports = subscribeRouter;