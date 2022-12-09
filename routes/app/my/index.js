const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {state, nkcModules, data} = ctx;
    data.userColumn = await data.user.extendColumn();
    data.userCertsName = await data.user.getCertsNameString();
    data.userScores = await db.UserModel.getUserScoresInfo(data.user.uid);
    ctx.template = "app/my/my.pug";
    await next();
  });
module.exports = router;
