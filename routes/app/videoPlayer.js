const Router = require('koa-router');
const { Public } = require('../../middlewares/permission');
const router = new Router();
router.get('/', Public(), async (ctx, next) => {
  ctx.template = 'app/videoPlayer/videoPlayer.pug';
  await next();
});
module.exports = router;
