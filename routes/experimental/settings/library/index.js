const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    data.librarySettings = await db.SettingModel.getSettings("library");
    data.roles = await db.RoleModel.find({_id: {$nin: ["default", "visitor"]}}).sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({toc: 1});
    ctx.template = "experimental/settings/library/library.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body} = ctx;
    const {roles, grades, libraryTip} = body;
    await db.SettingModel.updateOne({_id: "library"}, {$set: {
      "c.permission": {
        roles,
        grades
      },
     "c.libraryTip": {
        tipShow: libraryTip.tipShow,
        tipUpload: libraryTip.tipUpload
     }
    }});
    await db.SettingModel.saveSettingsToRedis("library");
    await next();
  });
module.exports = router;
