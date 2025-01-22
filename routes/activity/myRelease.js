const Router = require('koa-router');
const { OnlyUnbannedUser, OnlyUser } = require('../../middlewares/permission');
const myReleaseRouter = new Router();
myReleaseRouter.get('/', OnlyUser(), async (ctx, next) => {
  const { data, db, params, query } = ctx;
  const { user } = data;
  if (!user) {
    ctx.throw(400, '尚未登陆');
  }
  const releases = await db.ActivityModel.find({ uid: user.uid }).sort({
    toc: 1,
  });
  data.releases = releases;
  ctx.template = 'activity/myActivityRelease.pug';
  await next();
});
module.exports = myReleaseRouter;
