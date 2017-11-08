const Router = require('koa-router');
const subscribeRouter = new Router();

subscribeRouter
  .get('/follow', async (ctx, next) => {
    const uid = ctx.params.uid;
    const user = await ctx.db.subscribeModel.find({uid},{subscribeUsers: 1});
    const data = {user};
    ctx.data = data;
    await next()
  })
  .get('/fans', async (ctx, next) => {
    const uid = ctx.params.uid;
    const user = await ctx.db.subscribeModel.find({uid},{subscribers: 1});
    const data = {user};
    data;
    await next()
  })
  .get('/forums', async (ctx, next) => {
    const uid = ctx.params.uid;
    const user = await ctx.db.subscribeModel.find({uid},{subscribeForums: 1});
    const data = {user};
    ctx.data = data;
    await next()
  })
  // 关注该用户
  .post('/', async (ctx, next) => {
    let {uid} = ctx.params;
    if(!uid) ctx.throw(400, '参数不正确');
    let {db} = ctx;
    let {user} = ctx.data;
    if(user.uid === uid) ctx.throw(404, '关注自己干嘛？');
    let subscribersOfDB = await db.UserSubscribeModel.findOneAndUpdate({uid: uid}, {$addToSet: {subscribers: user.uid}});
    let subscribeUsersOfDB = await db.UserSubscribeModel.findOneAndUpdate({uid: user.uid}, {$addToSet: {subscribeUsers: uid}});
    if(subscribersOfDB.subscribers.indexOf(user.uid) > -1 && subscribeUsersOfDB.subscribeUsers.indexOf(uid) > -1) ctx.throw(404, '您之前已经关注过该用户了，没有必要重新关注');
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
    if(subscribersOfDB.subscribers.indexOf(user.uid) === -1 && subscribeUsersOfDB.subscribers.indexOf(uid) === -1) ctx.throw(404, '您之前没有关注过该用户，操作无效');
    ctx.data.message = `取消关注 uid:${uid} 成功`;
    await next();
  });

module.exports = subscribeRouter;