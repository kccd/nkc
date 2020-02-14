const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.roles = await db.RoleModel.find({_id: {$ne: "visitor"}}).sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({toc: 1});
    data.hidePostSettings = await db.SettingModel.getSettings("hidePost");
    ctx.template = "experimental/settings/hidePost/hidePost.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, data, body, nkcModules} = ctx;
    const {hidePostSettings} = body;
    let {
      rolesId, defaultRoleGradesId, postHeight, hideDigestPost, voteUpCount,
      allowedAuthor, allowedRolesId
    } = hidePostSettings;
    let {xs, md, sm, float = 0.5} = postHeight;
    postHeight.float = float;
    const {checkNumber} = nkcModules.checkData;
    checkNumber(float, {
      min: 0.1,
      fractionDigits: 2
    });
    checkNumber(xs, {
      min: 1
    });
    checkNumber(md, {
      min: 1
    });
    checkNumber(sm, {
      min: 1
    });
    checkNumber(voteUpCount, {
      name: "点赞数",
      min: 1
    });
    const roles = await db.RoleModel.find({_id: {$in: rolesId}});
    rolesId = roles.map(r => r._id);
    const grades = await db.UsersGradeModel.find({_id: {$in: defaultRoleGradesId}});
    defaultRoleGradesId = grades.map(g => g._id);
    await db.SettingModel.updateOne({_id: "hidePost"}, {
      $set: {
        "c.postHeight": postHeight,
        "c.rolesId": rolesId,
        "c.defaultRoleGradesId": defaultRoleGradesId,
        "c.hideDigestPost": !!hideDigestPost,
        "c.voteUpCount": voteUpCount,
        "c.allowedAuthor": !!allowedAuthor,
        "c.allowedRolesId": allowedRolesId
      }
    });
    await db.SettingModel.saveSettingsToRedis("hidePost");
    await next();
  });
module.exports = router;