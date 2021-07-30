const Router = require("koa-router");
const Querys = require("./query");
const SettingModel = require("../../../../dataModels/SettingModel");
const UsersPersonalModel = require("../../../../dataModels/UsersPersonalModel");

const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.safeSettings = (await db.SettingModel.findById("safe")).c;
    data.safeSettings.hasPassword = !!data.safeSettings.experimentalPassword.hash;
    delete data.safeSettings.experimentalPassword;
    data.weakPasswordChecking = db.WeakPasswordResultModel.isChecking();
    ctx.template = "experimental/settings/safe/safe.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {safeSettings} = body;
    const { phoneVerify } = safeSettings;
    safeSettings.experimentalVerifyPassword = !!safeSettings.experimentalVerifyPassword;
    if(safeSettings.experimentalTimeout >= 5) {}
    else {
      ctx.throw(400, "后台密码过期时间不能小于5分钟");
    }
    const _ss = await db.SettingModel.getSettings('safe');
    if(!_ss.experimentalPassword.hash && safeSettings.experimentalVerifyPassword) ctx.throw(400, '请设置后台密码');
    await db.SettingModel.updateOne({_id: "safe"}, {
      $set: {
        "c.experimentalVerifyPassword": safeSettings.experimentalVerifyPassword,
        "c.experimentalTimeout": safeSettings.experimentalTimeout,
        "c.phoneVerify": {
          enable: phoneVerify.enable,
          interval: phoneVerify.interval
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis("safe");
    await next();
  })
  .get("/unverifiedPhone", async (ctx, next) => {
    ctx.template = "experimental/settings/safe/unverifiedPhone/unverifiedPhone.pug";
    const { data, db, nkcModules, query } = ctx;
    const { page = 0, type, content } = query;

    let result = {};
    if(!type || !content) {
      result = await Querys.queryUnverifiedPhone(page);
    } else if(type === "username") {
      result = await Querys.queryUnverifiedPhoneByUsername(page, content);
    } else if(type === "phone") {
      result = await Querys.queryUnverifiedPhoneByPhone(page, content);
    } else if(type === "uid") {
      result = await Querys.queryUnverifiedPhoneByUid(page, content);
    }

    const { paging, personals } = result;
    data.paging = paging;

    const earliestDate = await Querys.getEarliestDate();
    const personalObj = personals.map(person => {
      const { nationCode, mobile } = person;
        if(person.lastVerifyPhoneNumberTime) {
          person.timeout = (earliestDate - person.lastVerifyPhoneNumberTime) / 1000 / 60 / 60;
        }
        if(nationCode && mobile) {
          person.mobile = `+${nationCode} ${mobile.substring(0, 3)}****${mobile.substring(7)}`;
        }
        return person;
      }
    );
    data.list = personalObj;
    return next();
  })
  .post("/modifyPassword", async (ctx, next) => {
    const { nkcModules } = ctx;
    const { oldPassword, newPassword } = ctx.body;
    const passwordObj = nkcModules.apiFunction.newPasswordObject(newPassword);
    await SettingModel.updateOne({_id: "safe"}, {
      $set: {
        "c.experimentalPassword": {
          hash: passwordObj.password.hash,
          salt: passwordObj.password.salt,
          secret: passwordObj.secret
        }
      }
    });
    return next();
  })
  .get("/weakPasswordCheck", async (ctx, next) => {
    const { db } = ctx;
    if(db.WeakPasswordResultModel.isChecking()) {
      ctx.throw(403, "检测尚未结束，请稍后直接查看结果");
    }
    db.WeakPasswordResultModel.weakPasswordCheck();
    return next();
  })
  .get("/weakPasswordCheck/result", async (ctx, next) => {
    ctx.template = "experimental/settings/safe/weakPasswordCheck/weakPasswordCheck.pug";
    const { data, db, nkcModules, query } = ctx;
    const { page = 0, type, content } = query;
    const count = await db.WeakPasswordResultModel.countDocuments();
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    data.list = await db.WeakPasswordResultModel.aggregate([
      { $match: {} },
      { $skip: paging.start },
      { $limit: paging.perpage },
      { $lookup: {
          from: "users",
          localField: "uid",
          foreignField: "uid",
          as: "userinfo"
      } },
      { $unwind: "$userinfo" },
      { $project: {
          uid: 1,
          password: 1,
          toc: 1,
          _id: 0,
          "userinfo.username": 1,
          "userinfo.avatar": 1
      } }
    ]);
    return next();
  });
module.exports = router;