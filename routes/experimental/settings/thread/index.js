const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.threadSettings = await db.SettingModel.getSettings("thread");
    data.grades = await db.UsersGradeModel.find({}).sort({toc: -1});
    data.roles = await db.RoleModel.find({_id: {$nin: ["default"]}}).sort({toc: -1});
    ctx.template = "experimental/settings/thread/thread.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body} = ctx;
    let {gradesId, rolesId} = body.threadSettings.displayPostAttachments;
    let {isDisplay, tipContent} = body.threadSettings.playerTips;
    rolesId = rolesId.filter(r => r !== "default");
    const grades = await db.UsersGradeModel.find({_id: {$in: gradesId}});
    const roles = await db.RoleModel.find({_id: {$in: rolesId}});
    await db.SettingModel.updateOne({
      _id: "thread"
    }, {
      $set: {
        "c.displayPostAttachments": {
          rolesId: roles.map(r => r._id),
          gradesId: grades.map(g => g._id)
        },
        "c.playerTips": {
          isDisplay,
          tipContent
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis("thread");
    await next();
  });
module.exports = router;
