const Router = require('koa-router');
const forumRouter = new Router();


forumRouter
  .get('/:fid', async (ctx, next) => {
    const fid = ctx.params.fid;
    ctx.data = `板块 ${fid}`;
    next();
  })
  // .use('/set', setRouter.routes(), setRouter.allowedMethods())
module.exports = forumRouter;