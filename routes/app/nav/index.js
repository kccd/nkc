const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, db, data} = ctx;
    data.code = await db.UserModel.getCode(data.user.uid);
    data.code = data.code.pop();
    ctx.template = "app/nav/nav.pug";
    data.managementData = await db.SettingModel.getManagementData(data.user);
    data.appsData = await db.SettingModel.getAppsData();
    data.userCertsName = await data.user.getCertsNameString();
    await next();
  });
module.exports = router;
