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
    const {db, body, nkcModules} = ctx;
    let {gradesId, rolesId} = body.threadSettings.displayPostAttachments;
    const {disablePost} = body.threadSettings;
    let {isDisplay, tipContent} = body.threadSettings.playerTips;
    rolesId = rolesId.filter(r => r !== "default");
    const grades = await db.UsersGradeModel.find({_id: {$in: gradesId}});
    const roles = await db.RoleModel.find({_id: {$in: rolesId}});
    const disablePostRoles = await db.RoleModel.find({
      _id: {
        $in: disablePost.rolesId,
        $ne: 'default'
      }
    });
    const disablePostGrades = await db.UsersGradeModel.find({
      _id: {$in: disablePost.gradesId}
    });
    disablePost.status = !!disablePost.status;
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
        },
        "c.disablePost": {
          status: !!disablePost.status,
          time: (disablePost.time || '2000-01-01').trim(),
          errorInfo: (disablePost.errorInfo || ''),
          rolesId: disablePostRoles.map(r => r._id),
          gradesId: disablePostGrades.map(g => g._id),
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis("thread");
    await next();
  });
module.exports = router;
