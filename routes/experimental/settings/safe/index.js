const Router = require("koa-router");

const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.safeSettings = (await db.SettingModel.findById("safe")).c;
    data.safeSettings.hasPassword = !!data.safeSettings.experimentalPassword.hash;
    delete data.safeSettings.experimentalPassword;
    ctx.template = "experimental/settings/safe/safe.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {safeSettings, password} = body;
    const { phoneVerify } = safeSettings;
    safeSettings.experimentalVerifyPassword = !!safeSettings.experimentalVerifyPassword;
    if(safeSettings.experimentalTimeout >= 5) {}
    else {
      ctx.throw(400, "后台密码过期时间不能小于5分钟");
    }
    const obj = {
      "c.experimentalVerifyPassword": safeSettings.experimentalVerifyPassword,
      "c.experimentalTimeout": safeSettings.experimentalTimeout,
      "c.phoneVerify": {
        enable: phoneVerify.enable === "true",
        interval: parseFloat(phoneVerify.interval)
      }
    };
    const _ss = await db.SettingModel.getSettings('safe');
    if(!_ss.experimentalPassword.hash && !password && safeSettings.experimentalVerifyPassword) ctx.throw(400, '请设置后台密码');
    if(password) {
      const passwordObj = nkcModules.apiFunction.newPasswordObject(password);
      obj['c.experimentalPassword'] = {
        hash: passwordObj.password.hash,
        salt: passwordObj.password.salt,
        secret: passwordObj.secret
      }
    }
    await db.SettingModel.updateOne({_id: "safe"}, {
      $set: obj
    });
    await db.SettingModel.saveSettingsToRedis("safe");
    await next();
  })
  .get("/unverifiedPhone", async (ctx, next) => {
    ctx.template = "experimental/settings/safe/unverifiedPhone/unverifiedPhone.pug";
    const { data, db, nkcModules, query } = ctx;
    const { page = 0, type, content } = query;
    const safeSetting = await db.SettingModel.getSettings("safe");
    const { enable, interval  } = safeSetting.phoneVerify;
    if(!enable) {
      data.list = [];
      return next();
    }
    // 现在的时间 - 间隔时间 => 最近应该进行验证的时间
    // 最后验证时间 < 最近应该进行验证的时间 说明验证过期了
    const earliestDate = new Date(Date.now() - interval * 60 * 60 * 1000);
    let personal;
    if(!type || !content) {
      const count = await db.UsersPersonalModel.count({
        $or: [{
          lastVerifyPhoneNumberTime: { $exists: false }
        }, {
          lastVerifyPhoneNumberTime: { $lt: earliestDate }
        }]
      });
      const paging = nkcModules.apiFunction.paging(page, count);
      data.paging = paging;
      personal = await db.UsersPersonalModel.aggregate([
        { $match: {
            $or: [
              { lastVerifyPhoneNumberTime: { $exists: false } },
              { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
            ]
        } },
        { $sort: { lastVerifyPhoneNumberTime: -1 } },
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
            lastVerifyPhoneNumberTime: 1,
            nationCode: 1,
            mobile: 1,
            _id: 0,
            "userinfo.username": 1,
            "userinfo.avatar": 1
        } },
      ]).exec();
    } else if(type === "username") {
      personal = await db.UsersPersonalModel.aggregate([
        { $match: {
            $or: [
              { lastVerifyPhoneNumberTime: { $exists: false } },
              { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
            ]
        } },
        { $lookup: {
            from: "users",
            localField: "uid",
            foreignField: "uid",
            as: "userinfo"
        } },
        { $unwind: "$userinfo" },
        { $match: {
          "userinfo.username": content
        } },
        { $project: {
              uid: 1,
              lastVerifyPhoneNumberTime: 1,
              nationCode: 1,
              mobile: 1,
              _id: 0,
              "userinfo.username": 1,
              "userinfo.avatar": 1
        } },
      ]).exec();
    } else if(type === "phone") {
      personal = await db.UsersPersonalModel.aggregate([
        { $match: {
            $or: [
              { lastVerifyPhoneNumberTime: { $exists: false } },
              { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
            ],
            mobile: content
        } },
        { $lookup: {
            from: "users",
            localField: "uid",
            foreignField: "uid",
            as: "userinfo"
        } },
        { $unwind: "$userinfo" },
        { $project: {
              uid: 1,
              lastVerifyPhoneNumberTime: 1,
              nationCode: 1,
              mobile: 1,
              _id: 0,
              "userinfo.username": 1,
              "userinfo.avatar": 1
        } },
      ]).exec();
    } else if(type === "uid") {
      personal = await db.UsersPersonalModel.aggregate([
        { $match: {
            $or: [
              { lastVerifyPhoneNumberTime: { $exists: false } },
              { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
            ],
            uid: content
        } },
        { $lookup: {
            from: "users",
            localField: "uid",
            foreignField: "uid",
            as: "userinfo"
        } },
        { $unwind: "$userinfo" },
        { $project: {
              uid: 1,
              lastVerifyPhoneNumberTime: 1,
              nationCode: 1,
              mobile: 1,
              _id: 0,
              "userinfo.username": 1,
              "userinfo.avatar": 1
        } },
      ]).exec();
    }
    const personalObj = personal.map(person => {
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
    const count = await db.WeakPasswordResultModel.count();
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
