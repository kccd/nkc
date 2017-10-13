const Router = require('koa-router');
const idRouter = new Router();
idRouter
  .get('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    const user = await ctx.db.userModel.find({uid});
    const data = {user};
    ctx.body = ctx.nkcModules.render('./pages/user.pug', {data});
    next()
  });
module.exports = idRouter;