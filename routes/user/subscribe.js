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
  .post('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data = `关注${uid}`;
  })
  .del('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data = `取消关注${uid}`;
  });

module.exports = subscribeRouter;