const Router = require('koa-router');
const pageRouter = new Router();
const { Public } = require('../middlewares/permission');
pageRouter.get('/faq', Public(), async (ctx, next) => {
  return ctx.redirect(`/p/822194`);
});
module.exports = pageRouter;
