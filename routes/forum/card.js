const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data, params} = ctx;
    const {fid} = params;
    const forum = await db.ForumModel.findOnly({fid});
    await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
    if(data.user) {
      const subForumsId = await db.SubscribeModel.getUserSubForumsId(data.user.uid);
      data.subscribed = subForumsId.includes(fid);
    }
    data.forum = forum;
    await next();
  });
module.exports = router;