const Router = require('koa-router');
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    ctx.data.forums = await ctx.nkcModules.dbFunction.getAvailableForums(ctx);
    await next()
  })
  .get('/:fid', async (ctx, next) => {
    const data = ctx.data;
    ctx.template = 'interface_forum.pug';
    const {fid} = ctx.params;
    const {ForumModel} = ctx.db;
    const {query} = ctx;
    const forum = await ForumModel.findOne({fid});
    const threads = await forum.getThreadsByQuery(query);
    data.forum = forum;
    data.threads = threads;
    await next()
  });

module.exports = forumRouter;