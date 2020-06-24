const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    const {user} = data;
    user.kcb = await db.UserModel.updateUserKcb(user.uid);
    const usersPersonal = await db.UsersPersonalModel.findById(user.uid);
    const {alipayAccounts, bankAccounts} = usersPersonal;
    data.alipayAccounts = alipayAccounts;
    data.bankAccounts = bankAccounts;
    const kcbSettings = await db.SettingModel.findById("kcb");
    data.withdrawSettings = {
      withdrawAuth: kcbSettings.c.withdrawAuth,
      withdrawTimeBegin: kcbSettings.c.withdrawTimeBegin,
      withdrawTimeEnd: kcbSettings.c.withdrawTimeEnd,
      withdrawCount: kcbSettings.c.withdrawCount,
      withdrawMin: kcbSettings.c.withdrawMin,
      withdrawMax: kcbSettings.c.withdrawMax,
      withdrawStatus: kcbSettings.c.withdrawStatus,
      withdrawFee: kcbSettings.c.withdrawFee
    };
    const today = nkcModules.apiFunction.today();
    data.countToday = await db.KcbsRecordModel.count({
      from: user.uid,
      to: "bank",
      type: "withdraw",
      toc: {
        $gte: today
      }
    });
    data.userScores = await db.UserModel.getUserScores(user.uid);
    ctx.template = 'account/finance/withdraw.pug';
    await next();
  })
  .post("/", async (ctx, next) => {
    const {nkcModules, data, db, body} = ctx;
    const lock = await nkcModules.redLock.lock("withdraw", 6000);
    try{
      const {user} = data;
      let {money, password, code, to, account} = body;
      const kcbSettings = await db.SettingModel.findById("kcb");
      const {
        withdrawTimeEnd,
        withdrawTimeBegin,
        withdrawCount,
        withdrawStatus,
        withdrawMax,
        withdrawMin,
        withdrawFee,
      } = kcbSettings.c;
      if(!withdrawStatus) ctx.throw(403, "提现功能暂未开放");
      const today = nkcModules.apiFunction.today();
      const countToday = await db.KcbsRecordModel.count({
        from: user.uid,
        to: "bank",
        type: "withdraw",
        toc: {
          $gte: today
        }
      });
      if(countToday >= withdrawCount) ctx.throw(403, "您今日的提现次数已用完，请明天再试");
      user.kcb = await db.UserModel.updateUserKcb(user.uid);
      const usersPersonal = await db.UsersPersonalModel.findById(user.uid);
      money = money.toFixed(0);
      money = Number(money);
      if(money > 0){}
      else ctx.throw(400, "提现金额不正确");
      if(money < withdrawMin) ctx.throw(400, `提现金额不得低于${withdrawMin/100}元`);
      if(money > user.kcb) ctx.throw(400, `科创币不足`);
      if(money > withdrawMax) ctx.throw(400, `提现金额不能超过${withdrawMax/100}元`);
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
      await smsCode.update({used: true});
      let now = new Date();
      // 验证登录密码
      await usersPersonal.ensurePassword(password);
      now = now.getHours()*60*60*1000 + now.getMinutes()*60*1000 + now.getSeconds()*1000;
      if(now < withdrawTimeBegin || now > withdrawTimeEnd) ctx.throw(403, "提现暂未开放");

      if(to === "alipay") {
        const {alipayAccounts} = usersPersonal;
        let existing = false;
        for(const a of alipayAccounts) {
          if(a.account === account.account && a.name === account.name) existing = true;
        }
        if(!existing) ctx.throw(400, "您未绑定该收款账户，请检查");
        const _id = await db.SettingModel.operateSystemID("kcbsRecords", 1);
        const description = `科创币提现`;

        const record = await db.KcbsRecordModel({
          _id,
          from: user.uid,
          to: "bank",
          type: "withdraw",
          ip: ctx.address,
          port: ctx.port,
          num: money,
          description,
          c: {
            alipayAccount: account.account,
            alipayName: account.name,
            alipayFee: withdrawFee,
            alipayInterface: null
          }
        });

        await record.save();
        try {
          let alipayMoney = money*(1-withdrawFee);
          alipayMoney = alipayMoney/100;
          alipayMoney = alipayMoney.toFixed(2);
          await nkcModules.alipay2.transfer({
            account: account.account,
            name: account.name,
            money: alipayMoney,
            id: _id,
            notes: description
          });

          await record.update({
            "c.alipayInterface": true
          });

          user.kcb = await db.UserModel.updateUserKcb(user.uid);

        } catch(err) {
          await record.update({
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
  });
module.exports = router;
