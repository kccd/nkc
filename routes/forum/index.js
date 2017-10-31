const Router = require('koa-router');
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    ctx.data.forums = await ctx.nkcModules.dbFunction.getAvailableForums(ctx);
    await next()
  })
  .get('/:fid', async (ctx, next) => {
    const data = ctx.data;
    data.template = 'interface_forum.pug';
    const {fid} = ctx.params;
    const {ForumModel} = ctx.dataModels;
    const {query} = ctx;
    const forum = await ForumModel.findOne({fid});
  });

module.exports = forumRouter;