const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.stickerSettings = await db.SettingModel.getSettings("sticker");
    ctx.template = "experimental/settings/sticker/sticker.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {body, db} = ctx;
    const {stickerSettings} = body;
    const {checkString} = ctx.nkcModules.checkData;
    const {notesAboutUploading, notesAboutUsing} = stickerSettings;
    checkString(notesAboutUploading, {
      name: "上传提示",
      minLength: 1,
      maxLength: 10000
    });
    checkString(notesAboutUsing, {
      name: "使用提示",
      minLength: 1,
      maxLength: 10000
    });
    await db.SettingModel.updateOne({_id: "sticker"}, {
      $set: {
        c: {
          notesAboutUploading,
          notesAboutUsing
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis("sticker");
    await next();
  });
module.exports = router;
