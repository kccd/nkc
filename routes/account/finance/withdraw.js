const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    ctx.template = 'account/finance/withdraw.pug';
    await next();
  });
module.exports = router;