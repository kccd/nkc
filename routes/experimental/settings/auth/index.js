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
    const {db, body, nkcModules} = ctx;
    const {checkString} = nkcModules.checkData;
    const {auditorId, auditorCerts, auth3Content,auth2Content,auth1Content} = body.authSettings;
    const uidArr = [];
    const certsId = [];
    checkString(auth3Content, {
      name: '身份认证 3 提示语',
      minLength: 1,
      maxLength: 5000
    });
    checkString(auth2Content, {
      name: '身份认证 2 提示语',
      minLength: 1,
      maxLength: 5000
    });
    checkString(auth1Content, {
      name: '身份认证 1 提示语',
      minLength: 1,
      maxLength: 5000
    });
    for(const uid of auditorId) {
      console.log(uid);
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
        "c.auth3Content": auth3Content,
        "c.auth1Content":auth1Content,
        "c.auth2Content":auth2Content,
        "c.auditorId": uidArr,
        "c.auditorCerts": certsId
      }
    });
    await db.SettingModel.saveSettingsToRedis("auth");
    await next();
  });
module.exports = router;
