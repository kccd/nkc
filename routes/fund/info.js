const Router = require('koa-router');
const { Public } = require('../../middlewares/permission');
const infoRouter = new Router();
infoRouter.get('/', Public(), async (ctx, next) => {
  ctx.template = 'fund/info/info.pug';
  await next();
});
module.exports = infoRouter;
