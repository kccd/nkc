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
    ctx.template = "experimental/settings/transfer/transfer.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data, nkcModules} = ctx;
    const {user} = data;
    const {from, to, password, num} = body;
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

    if(fromUser && fromUser.kcb < kcb) ctx.throw(400, "支付方科创币不足");

    const record = db.KcbsRecordModel({
      _id: await db.SettingModel.operateSystemID("kcbsRecords", 1),
      from,
      to,
      type: "transfer",
      num: kcb,
      ip: ctx.address,
      port: ctx.port
    });

    await record.save();
    if(from !== "bank") {
      await db.UserModel.updateUserKcb(from);
      data.from = await db.UserModel.findOne({uid: from});
    }
    if(to !== "bank") {
      await db.UserModel.updateUserKcb(to);
      data.to = await db.UserModel.findOne({uid: to});
    }

    await next();
  });
module.exports = router;