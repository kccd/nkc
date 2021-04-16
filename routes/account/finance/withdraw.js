const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    const {user} = data;
    const usersPersonal = await db.UsersPersonalModel.findById(user.uid);
    const {alipayAccounts, bankAccounts} = usersPersonal;
    data.alipayAccounts = alipayAccounts;
    data.bankAccounts = bankAccounts;
    const rechargeSettings = await db.SettingModel.getSettings('recharge');
    data.withdrawSettings = await rechargeSettings.withdraw;
    const today = nkcModules.apiFunction.today();
    data.countToday = await db.KcbsRecordModel.countDocuments({
      from: user.uid,
      to: "bank",
      type: "withdraw",
      toc: {
        $gte: today
      },
      verify: true,
    });
    data.mainScore = await db.SettingModel.getMainScore();
    data.userScores = await db.UserModel.updateUserScores(user.uid);
    data.userMainScore = await db.UserModel.getUserMainScore(user.uid);
    ctx.template = 'account/finance/withdraw.pug';
    await next();
  })
  .post("/", async (ctx, next) => {
    const {nkcModules, data, db, body} = ctx;
    const lock = await nkcModules.redLock.lock("withdraw", 6000);
    const {checkNumber} = nkcModules.checkData;
    try{
      const {user} = data;
      let {money, password, code, to, account, score} = body;
      const rechargeSettings = await db.SettingModel.getSettings('recharge');
      const {enabled, min, max, startingTime, endTime, countOneDay} = rechargeSettings.withdraw;
      const payment = rechargeSettings.withdraw[to];
      if(!enabled) ctx.throw(403, "提现功能已关闭");
      const today = nkcModules.apiFunction.today();
      const countToday = await db.KcbsRecordModel.countDocuments({
        from: user.uid,
        to: "bank",
        type: "withdraw",
        toc: {
          $gte: today
        },
        verify: true,
      });
      if(countToday >= countOneDay) ctx.throw(403, "你今日的提现次数已用完，请明天再试");
      checkNumber(money, {
        name: '提现金额',
        min: min / 100,
        max: max / 100,
        fractionDigits: 2,
      });
      const _money = Number((score * (1 - payment.fee)).toFixed(2));
      if(_money !== money) ctx.throw(400, '页面数据已更新，请刷新后重试');
      score = Number((score * 100).toFixed(0));
      await db.UserModel.updateUserScores(user.uid);
      const userMainScore = await db.UserModel.getUserMainScore(user.uid);
      const mainScore = await db.SettingModel.getMainScore();
      const usersPersonal = await db.UsersPersonalModel.findById(user.uid);
      if(score > userMainScore) ctx.throw(400, `你的${mainScore.name}不足`);
      if(!password) ctx.throw(400, "登录密码不能为空");
      if(!code) ctx.throw(400, "短信验证码不能为空");
      if(!to) ctx.throw(400, "提现账户类型错误");
      if(!account) ctx.throw(400, "目标账户不能为空");

      // 验证短信验证码
      const smsObj = {
        type: "withdraw",
        code,
        mobile: usersPersonal.mobile,
        nationCode: usersPersonal.nationCode
      };
      const smsCode = await db.SmsCodeModel.ensureCode(smsObj);
      await smsCode.updateOne({used: true});
      let now = new Date();
      // 验证登录密码
      await usersPersonal.ensurePassword(password);
      now = now.getHours()*60*60*1000 + now.getMinutes()*60*1000 + now.getSeconds()*1000;
      if(now < startingTime || now > endTime) ctx.throw(403, "提现暂未开放");

      if(to === "aliPay") {
        const {alipayAccounts} = usersPersonal;
        let existing = false;
        for(const a of alipayAccounts) {
          if(a.account === account.account && a.name === account.name) existing = true;
        }
        if(!existing) ctx.throw(400, "你未绑定该收款账户，请检查");
        const _id = await db.SettingModel.operateSystemID("kcbsRecords", 1);
        const description = `${mainScore.name}提现`;

        const record = await db.KcbsRecordModel({
          _id,
          from: user.uid,
          to: "bank",
          type: "withdraw",
          scoreType: mainScore.type,
          fee: payment.fee,
          ip: ctx.address,
          port: ctx.port,
          num: score,
          description,
          c: {
            alipayAccount: account.account,
            alipayName: account.name,
            alipayFee: payment.fee,
            alipayInterface: null
          }
        });

        await record.save();
        try {
          await nkcModules.alipay2.transfer({
            account: account.account,
            name: account.name,
            money,
            id: _id,
            notes: description
          });

          await record.updateOne({
            "c.alipayInterface": true
          });
          await db.UserModel.updateUserScores(user.uid);

        } catch(err) {
          await record.updateOne({
            verify: false,
            "c.alipayInterface": false,
            error: JSON.stringify(err)
          });
          ctx.throw(400, err.message || err);
        }

      } else {
        ctx.throw(400, "未知的账户类型")
      }
    } catch(err) {
      await lock.unlock();
      ctx.throw(err);
    }
    await next();
  });
module.exports = router;
