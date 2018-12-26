const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    ctx.template = 'experimental/console/console.pug';
    await next();
  });
module.exports = router;