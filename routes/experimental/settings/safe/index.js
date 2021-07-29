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
  .post("/weak_password_check/:action", async (ctx, next) => {
    const { data } = ctx;
    const { action } = ctx.params;
    const { code, slice, handleUsers } = ctx.body;
    // 保存弱密码检测脚本
    if(action === "save_code") {
      console.log("> 保存脚本");
      await SettingModel.updateOne({ _id: "safe" }, {
        $set: {
          "c.tools.weakPasswordCheck.sourceCode": code
        }
      });
      await SettingModel.saveSettingsToRedis("safe");
    // 获取弱密码检测脚本
    } else if(action === "get_code") {
      console.log("> 获取脚本");
      const settings = await SettingModel.getSettings("safe");
      data.sourceCode = settings.tools.weakPasswordCheck.sourceCode;
    // 获取待检测密码的总数
    } else if(action === "data_count") {
      console.log("> 获取待检测密码总条数");
      data.count = await UsersPersonalModel.countDocuments();
    // 获取给定区间的待检测数据
    } else if(action === "get_data_slice") {
      const { start, length } = slice;
      console.log(`> 获取给定区间的待检测密码 start: ${start}  length: ${length}`);
      data.sliceData = await UsersPersonalModel.find({}, { uid: true, password: true }).skip(start).limit(length);
    // 处理用户(发送消息、封禁账号)
    } else if(action === "handle_user") {
      console.log(handleUsers);
      
    }
    return next();
  })
  .get("/weak_password_check_worker_script", async (ctx, next) => {
    const settings = await SettingModel.getSettings("safe");
    ctx.set("Content-Type", "application/javascript; charset=utf-8");
    ctx.body = workerSouceCode.replace("//// user code inject here", settings.tools.weakPasswordCheck.sourceCode);
    return;
  });
module.exports = router;

const workerSouceCode = `// weak password check worker
importScripts("/experimental/settings/safe/crypto-worker-lib.js");
//// user code inject here;
self.__WEAK_PASSWORD_CHECKER = true;
self.addEventListener("message", function (event) {
  var data = event.data;
  if (Object.prototype.toString.call(data) !== "[object Array]") {
    return self.postMessage({ isError: true, message: "worker only accepts a pure array" });
  }
  console.log("[Worker] starting tasks: ", data);
  var hits = [];
  for(var i in data) {
    var detail = data[i];
    if(!detail.password) {
      continue
    }
    if($check(detail.password)) {
      hits.push(detail)
      console.log("[Worker] hit: ", detail);
    }
  }
  console.log("[Worker] ended");
  self.postMessage(hits);
});
`;