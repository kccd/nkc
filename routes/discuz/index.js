const Router = require('koa-router');
const otherRouter = new Router();
const { Public } = require('../../middlewares/permission');
otherRouter.get(
  [
    'forum.php',
    'home.php',
    'index.php',
    'read.php',
    'read/:tid/:a/:b',
    'read/:tid',
    'read/:tid/:a',
    'read/:tid/:a/',
  ],
  Public(),
  async (ctx, next) => {
    let { tid, fid, uid } = ctx.query;
    tid = tid || ctx.params.tid;
    ctx.status = 301;
    if (tid) {
      return ctx.redirect(`/t/${tid}`);
    } else if (uid) {
      return ctx.redirect(`/u/${uid}`);
    } else if (fid) {
      return ctx.redirect(`/f/${fid}`);
    } else {
      ctx.throw(404, 'not found');
      await next();
    }
  },
);

module.exports = otherRouter;
