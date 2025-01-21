const Router = require('koa-router');
const { Public } = require('../../../../middlewares/permission');
const router = new Router();

router.get('/tree', Public(), async (ctx, next) => {
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
