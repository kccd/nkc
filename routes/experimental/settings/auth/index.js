const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const authSettings = await db.SettingModel.findById("auth");
    data.authSettings = authSettings.c;
    data.certs = await db.RoleModel.find({type: "management"});
    ctx.template = "experimental/settings/auth/auth.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {checkString, checkNumber} = nkcModules.checkData;
    const {auditorId, auditorCerts, auth3Content,auth2Content,auth1Content, verifyPhoneNumber} = body.authSettings;
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
      const u = await db.UserModel.findOne({uid}, {_id: 1});
      if(u) uidArr.push(uid);
    }
    for(const _id of auditorCerts) {
      const cert = await db.RoleModel.findOne({_id, type: "management"}, {_id: 1});
      if(cert) certsId.push(_id);
    }
    checkNumber(verifyPhoneNumber.interval, {
      name: '间隔时间',
      min: 1,
    });
    checkNumber(verifyPhoneNumber.unitInterval, {
      name: '累加时间',
      min: 0,
    });
    checkNumber(verifyPhoneNumber.maxInterval, {
      name: '间隔时间上限',
      min: 0,
    });
    if(!['reviewPost', 'disablePublish'].includes(verifyPhoneNumber.type)) {
      ctx.throw(400, `未验证手机号时的操作类型错误`);
    }
    checkString(verifyPhoneNumber.reviewPostContent, {
      name: '内容必审时的页面提示',
      minLength: 1,
      maxLength: 1000
    });
    checkString(verifyPhoneNumber.disablePublishContent, {
      name: '禁止发表时的页面提示',
      minLength: 1,
      maxLength: 1000
    });
    if (!['null','city','province','country'].includes(verifyPhoneNumber.address)) {
      ctx.throw(400, `登录间隔地址上限类型错误`);
    }
    await db.SettingModel.updateOne({
      _id: "auth"
    }, {
      $set: {
        "c.auth3Content": auth3Content,
        "c.auth1Content":auth1Content,
        "c.auth2Content":auth2Content,
        "c.auditorId": uidArr,
        "c.auditorCerts": certsId,
        'c.verifyPhoneNumber': {
          enabled: !!verifyPhoneNumber.enabled,
          interval: verifyPhoneNumber.interval,
          unitInterval: verifyPhoneNumber.unitInterval,
          maxInterval: verifyPhoneNumber.maxInterval,
          type: verifyPhoneNumber.type,
          reviewPostContent: verifyPhoneNumber.reviewPostContent,
          disablePublishContent: verifyPhoneNumber.disablePublishContent,
          address: verifyPhoneNumber.address
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis("auth");
    await next();
  });
module.exports = router;
