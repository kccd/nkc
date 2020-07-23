const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const authSettings = await db.SettingModel.findById("auth");
    data.authSettings = authSettings.c;
    data.certs = await db.RoleModel.find({type: "management"});
    ctx.template = "/experimental/settings/auth/auth.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body} = ctx;
    const {auditorId, auditorCerts} = body.authSettings;
    const uidArr = [];
    const certsId = [];
    for(const uid of auditorId) {
      const u = await db.UserModel.findOne({uid}, {_id: 1});
      if(u) uidArr.push(uid);
    }
    for(const _id of auditorCerts) {
      const cert = await db.RoleModel.findOne({_id, type: "management"}, {_id: 1});
      if(cert) certsId.push(_id);
    }
    await db.SettingModel.updateOne({
      _id: "auth"
    }, {
      $set: {
        "c.auditorId": uidArr,
        "c.auditorCerts": certsId
      }
    });
    await db.SettingModel.saveSettingsToRedis("auth");
    await next();
  });
module.exports = router;
