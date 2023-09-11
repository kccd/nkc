const Router = require('koa-router');
const router = new Router();
router.get('/', async (ctx, next) => {
  ctx.remoteTemplate = 'browser/index.pug';
  await next();
});
module.exports = router;
