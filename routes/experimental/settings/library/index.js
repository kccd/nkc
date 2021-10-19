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
    const {db, body, nkcModules} = ctx;
    const {roles, grades, libraryTip} = body;
    const {checkString} = nkcModules.checkData;
    checkString(libraryTip.tipShow, {
      name: '文库说明',
      minLength: 0,
      maxLength: 5000
    });
    checkString(libraryTip.tipUpload, {
      name: '文库上传说明',
      minLength: 0,
      maxLength: 5000
    });
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
