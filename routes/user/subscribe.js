const Router = require('koa-router');
const subscribeRouter = new Router();

subscribeRouter
  .get('/follow', async (ctx, next) => {
    const uid = ctx.params.uid;
    const user = await ctx.db.subscribeModel.find({uid},{subscribeUsers: 1});
    const data = {user};
    ctx.body = ctx.nkcModules.render('./pages/user.pug', {data});
    next()
  })
  .get('/fans', async (ctx, next) => {
    const uid = ctx.params.uid;
    const user = await ctx.db.subscribeModel.find({uid},{subscribers: 1});
    const data = {user};
    ctx.body = ctx.nkcModules.render('./pages/user.pug', {data});
    next()
  })
  .get('/forums', async (ctx, next) => {
    const uid = ctx.params.uid;
    const user = await ctx.db.subscribeModel.find({uid},{subscribeForums: 1});
    const data = {user};
    ctx.body = ctx.nkcModules.render('./pages/user.pug', {data});
    next()
  })
  .post('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.body = `关注${uid}`;
  })
  .del('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.body = `取消关注${uid}`;
  })

module.exports = subscribeRouter;