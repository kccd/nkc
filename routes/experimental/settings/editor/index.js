const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.editorSettings = await db.SettingModel.getSettings("editor");
    ctx.template = "experimental/settings/editor/editor.pug";
    await next();
  })
  .patch("/" , async (ctx, next) => {
    const {body, db} = ctx;
    const {checkString} = ctx.nkcModules.checkData;
    const {editorSettings} = body;
    checkString(editorSettings.notes, {
      name: "温馨提示",
      minLength: 1,
      maxLength: 10000
    });
    await db.SettingModel.updateOne({_id: "editor"}, {
      $set: {
        "c.notes": editorSettings.notes
      }
    });
    await db.SettingModel.saveSettingsToRedis("editor");
    await next();
  })
module.exports = router;