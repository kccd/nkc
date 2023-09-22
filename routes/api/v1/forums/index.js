const Router = require('koa-router');
const router = new Router();

router.get('/tree', async (ctx, next) => {
  const { db, data } = ctx;

  const forumsTree = await db.ForumModel.getForumsTree(
    data.userRoles,
    data.userGrade,
    data.user,
  );

  ctx.apiData = {
    forumsTree,
  };
  await next();
});

module.exports = router;
