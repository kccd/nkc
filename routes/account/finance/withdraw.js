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
    const {nkcModules, data, db, body, state} = ctx;
    const lock = await nkcModules.redLock.lock("withdraw", 6000);
    const {checkNumber} = nkcModules.checkData;
    try{
      const {user} = data;
      let {
        money,
        effectiveMoney,
        password,
        code,
        payment: selectPayment,
        account,
      } = body;

      if(!password) ctx.throw(400, "登录密码不能为空");
      if(!code) ctx.throw(400, "短信验证码不能为空");
      if(!selectPayment) ctx.throw(400, "提现账户类型错误");
      if(!account) ctx.throw(400, "目标账户不能为空");

      const rechargeSettings = await db.SettingModel.getSettings('recharge');
      const {enabled, min, max, startingTime, endTime, countOneDay} = rechargeSettings.withdraw;
      if(!enabled) ctx.throw(403, "提现功能已关闭");
      const payment = rechargeSettings.withdraw[selectPayment];
      if(!payment.enabled) ctx.throw(403, `当前提现方式已关闭，请刷新后再试`);
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
      const _effectiveMoney = Math.floor(money * (1 - payment.fee));
      if(_effectiveMoney !== effectiveMoney) ctx.throw(400, `页面数据已过期，请刷新后再试`);
      if(effectiveMoney < min) ctx.throw(400, `提现金额不能小于 ${min / 100} 元`);
      if(effectiveMoney > max) ctx.throw(400, `提现金额不能超过 ${max / 100} 元`);
      checkNumber(money, {
        name: '提现金额',
        min: 1
      });
      checkNumber(effectiveMoney, {
        name: '实际到账金额',
        min: 1
      });
      await db.UserModel.updateUserScores(user.uid);
      const userMainScore = await db.UserModel.getUserMainScore(user.uid);
      const mainScore = await db.SettingModel.getMainScore();
      const usersPersonal = await db.UsersPersonalModel.findById(user.uid);
      if(money > userMainScore) ctx.throw(400, `你的${mainScore.name}不足`);

      // 验证短信验证码
      const smsObj = {
        type: "withdraw",
        code,
        mobile: usersPersonal.mobile,
        nationCode: usersPersonal.nationCode,
        ip: ctx.address,
      };

      const smsCode = await db.SmsCodeModel.ensureCode(smsObj);
      await smsCode.updateOne({used: true});
      let now = new Date();
      // 验证登录密码
      await usersPersonal.ensurePassword(password);
      delete body.password;
      now = now.getHours()*60*60*1000 + now.getMinutes()*60*1000 + now.getSeconds()*1000;
      if(now < startingTime || now > endTime) ctx.throw(403, "提现暂未开放");

      if(selectPayment === "aliPay") {
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
          num: money,
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
          await db.AliPayRecordModel.transfer({
            uid: state.uid,
            money,
            effectiveMoney,
            fee: payment.fee,
            aliPayAccount: account.account,
            aliPayAccountName: account.name,
            clientIp: ctx.address,
            clientPort: ctx.port,
            from: 'score',
            description
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
