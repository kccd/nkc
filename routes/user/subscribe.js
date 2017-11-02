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
    await db.UserSubscribeModel.replaceOne({uid: uid}, {$addToSet: {subscribers: user.uid}});
    await db.UserSubscribeModel.replaceOne({uid: user.uid}, {$addToSet: {subscribeUsers: uid}});
    ctx.data.message = `关注 uid:${uid} 成功`;
    await next();
  })
  // 取消关注该用户
  .del('/', async (ctx, next) => {
    let {uid} = ctx.params;
    if(!uid) ctx.throw(400, '参数不正确');
    let {db} = ctx;
    let {user} = ctx.data;
    await db.UserSubscribeModel.replaceOne({uid: uid}, {$pull: {subscribers: user.uid}});
    await db.UserSubscribeModel.replaceOne({uid: user.uid}, {$pull: {subscribeUsers: uid}});
    ctx.data.message = `取消关注 uid:${uid} 成功`;
    await next();
  });

module.exports = subscribeRouter;