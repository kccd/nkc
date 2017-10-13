const Router = require('koa-router');
const experimentalRouter = new Router();
experimentalRouter
  .get('/', async (ctx, next) => {
    ctx.body = '管理 页面';
    next();
  })

module.exports = experimentalRouter;