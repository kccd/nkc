const Router = require("koa-router");
const router = new Router();
const transferConfigs = require("../../../../config/transferKCB");
router
  .use("/", async (ctx, next) => {
    const {user} = ctx.data;
    if(!transferConfigs.operatorId.includes(user.uid)) {
      ctx.throw(403, "权限不足");
    }
    await next();
  })
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    data.transferSettings = await db.SettingModel.getSettings("transfer");
    data.shopScore = await db.SettingModel.getScoreByOperationType('shopScore');
    data.enabledScores = await db.SettingModel.getEnabledScores();
    data.nkcBankName = await db.SettingModel.getNKCBankName();
    ctx.template = "experimental/settings/transfer/transfer.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data, nkcModules} = ctx;
    const {user} = data;
    const {from, to, password, num, scoreType} = body;
    const enabledScores = await db.SettingModel.getEnabledScores();
    const enabledScoresType = enabledScores.map(e => e.type);
    if(!enabledScoresType.includes(scoreType)) ctx.throw(400, '已选积分暂未开启，请刷新');
    const score = await db.SettingModel.getScoreByScoreType(scoreType);
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    try{
      await userPersonal.ensurePassword(password);
    } catch(err) {
      ctx.throw(400, "密码错误");
    }
    if(from === to) ctx.throw(400, "支付方和收款方不能相同");

    let fromUser;

    if(from !== "bank") {
      fromUser = await db.UserModel.findById(from);
    }
    if(to !== "bank") {
      await db.UserModel.findById(to);
    }
    nkcModules.checkData.checkNumber(num, {
      min: 0.01,
      fractionDigits: 2,
      name: "转账金额"
    });

    const kcb = num * 100;


    if(fromUser) {
      const fromUserScore = await db.UserModel.getUserScore(fromUser.uid, scoreType)
      if(fromUserScore < kcb) ctx.throw(400, `支付方${score.name}不足`);
    }

    const record = db.KcbsRecordModel({
      _id: await db.SettingModel.operateSystemID("kcbsRecords", 1),
      scoreType,
      from,
      to,
      type: "transfer",
      num: kcb,
      ip: ctx.address,
      port: ctx.port
    });

    await record.save();
    if(from !== "bank") {
      await db.UserModel.updateUserScores(from);
      // await db.UserModel.updateUserKcb(from);
      data.from = await db.UserModel.findOne({uid: from});
    }
    if(to !== "bank") {
      await db.UserModel.updateUserScores(to);
      // await db.UserModel.updateUserKcb(to);
      data.to = await db.UserModel.findOne({uid: to});
    }

    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {transferSettings} = body;
    const {checkNumber} = nkcModules.checkData;
    const {
      kcbOnce, countOneDay, countToUserOneDay
    } = transferSettings;
    checkNumber(kcbOnce, {
      name: "单次转账KCB上限",
      min: 0,
      fractionDigits: 2
    });
    checkNumber(countOneDay, {
      name: "每天转账总次数上限",
      min: 0
    });
    checkNumber(countToUserOneDay, {
      name: "对同一用户每天转账次数上限",
      min: 0
    });
    await db.SettingModel.updateOne({_id: "transfer"}, {
      $set: {
        c: {
          kcbOnce: parseInt(kcbOnce * 100),
          countOneDay,
          countToUserOneDay
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis("transfer");
    await next();
  });
module.exports = router;
