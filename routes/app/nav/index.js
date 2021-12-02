const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, db, data} = ctx;
    data.code = await db.UserModel.getCode(data.user.uid);
    data.code = data.code.pop();
    ctx.template = "app/nav/nav.pug";
    await nkcModules.apiFunction.extendManagementInfo(ctx);
    await next();
  });
module.exports = router;
