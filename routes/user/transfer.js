const router = require("koa-router")();
router
  .use("/", async (ctx, next) => {
    const {nkcModules, data, db} = ctx;
    const {targetUser, user} = data;
    const today = nkcModules.apiFunction.today();
    const {
      kcbOnce,
      countOneDay,
      countToUserOneDay
    } = await db.SettingModel.getSettings("transfer");

    data.kcbOnce = kcbOnce;

    if(targetUser.uid === user.uid) ctx.throw(403, `不允许给自己转账`);

    // 判断是否发生过交易 账单
    const order = await db.ShopOrdersModel.findOne({
      sellUid: user.uid,
      buyUid: targetUser.uid,
      orderStatus: {$ne: "unCost"}
    });

    if(!order) ctx.throw(403, "对方未购买过你出售的商品，无法转账");

    const transferCount = await db.KcbsRecordModel.count({
      from: user.uid,
      type: "transferToUser",
      toc: {$gte: today}
    });
    const transferToUserCount = await db.KcbsRecordModel.count({
      from: user.uid,
      type: "transferToUser",
      toc: {$gte: today},
      to: targetUser.uid
    });
    if(transferCount >= countOneDay) {
      ctx.throw(403, "你当天的转账总次数已达上限");
    } else if(transferToUserCount >= countToUserOneDay) {
      ctx.throw(403, "你当天与对方的转账总次数已达上限");
    }
    await next();
  })
  .get("/", async (ctx, next) => {
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, nkcModules, data} = ctx;
    const {checkNumber} = nkcModules.checkData;
    const {password, number} = body;
    const {user, kcbOnce, targetUser} =  data;
    checkNumber(number, {
      name: "转账金额",
      min: 1
    });
    if(!password) ctx.throw(400, "密码不能为空");
    if(number > kcbOnce) ctx.throw(400, `转账金额不能超过${kcbOnce/100}kcb`);
    const usersPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    await usersPersonal.ensurePassword(password);

    await db.UserModel.updateUserKcb(user.uid);

    if(user.kcb < number) ctx.throw(400, "你的kcb不足");

    const record = db.KcbsRecordModel({
      _id: await db.SettingModel.operateSystemID("kcbsRecords", 1),
      from: user.uid,
      to: targetUser.uid,
      type: "transferToUser",
      num: number,
      ip: ctx.address,
      port: ctx.port
    });

    await record.save();

    await db.UserModel.updateUserKcb(user.uid);
    await db.UserModel.updateUserKcb(targetUser.uid);
    await next();
  });
module.exports = router;