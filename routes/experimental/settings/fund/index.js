const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.fundSettings = await db.SettingModel.getSettings('fund');
    ctx.template = 'experimental/settings/fund/fund.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    const {user} = data;
    const {checkString, checkNumber} = nkcModules.checkData;
    const originFundSettings = await db.SettingModel.getSettings('fund');
    const {fundSettings} = ctx.body;
    const {
      closed,
      fundName,
      description,
      enableFund,
      terms,
      readOnly,
      donationDescription,
      fundPoolDescription,
      donation
    } = fundSettings;
    const {status, reason} = closed;
    if(status) {
      checkString(reason, {
        name: '临时页面提示内容',
        minLength: 1,
        maxLength: 100000,
      });
    }
    checkString(fundName, {
      name: '基金名称',
      minLength: 1,
      maxLength: 20
    });
    checkString(description, {
      name: '基金介绍',
      minLength: 1,
      maxLength: 100000
    });
    checkString(terms, {
      name: '基金条款',
      minLength: 1,
      maxLength: 100000
    });
    checkString(donationDescription, {
      name: '赞助说明',
      minLength: 1,
      maxLength: 100000
    });
    checkString(fundPoolDescription, {
      name: '资金池介绍',
      minLength: 1,
      maxLength: 100000
    });
    let closedUid = originFundSettings.closed.uid;
    let closingTime = originFundSettings.closed.closingTime;
    if(!originFundSettings.closed.status && !!status) {
      closedUid = user.uid;
      closingTime = new Date();
    }

    const {enabled, min, max, defaultMoney, payment} = donation;
    const {aliPay, wechatPay} = payment;
    checkNumber(min, {
      name: '单笔赞助最小金额',
      min: 1,
      max: 500000,
    });
    checkNumber(max, {
      name: '单笔赞助最大金额',
      min: 1,
      max: 500000,
    });
    if(min > max) {
      ctx.throw(400, `单笔赞助最小金额不能大于最大金额`);
    }

    for(let m of defaultMoney) {
      if(m < min || m > max) ctx.throw(400, `预设金额不在赞助金额范围内`);
    }

    checkNumber(aliPay.fee, {
      name: '支付宝支付手续费',
      min: 0,
      fractionDigits: 5,
    });
    checkNumber(wechatPay.fee, {
      name: '微信支付手续费',
      min: 0,
      fractionDigits: 5,
    });

    if(enabled && !aliPay.enabled && !wechatPay.enabled) {
      ctx.throw(400, `请至少启用一种支付方式`);
    }

    await db.SettingModel.updateOne({_id: 'fund'}, {
      $set: {
        'c.enableFund': !!enableFund,
        'c.fundName': fundName,
        'c.description': description,
        'c.terms': terms,
        'c.readOnly': !!readOnly,
        'c.closed': {
          status,
          reason,
          uid: closedUid,
          closingTime: closingTime
        },
        'c.donationDescription': donationDescription,
        'c.fundPoolDescription': fundPoolDescription,
        'c.donation': {
          enabled: !!enabled,
          min,
          max,
          defaultMoney,
          payment: {
            aliPay: {
              enabled: !!aliPay.enabled,
              fee: aliPay.fee
            },
            wechatPay: {
              enabled: !!wechatPay.enabled,
              fee: wechatPay.fee
            }
          }
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis('fund');
    await next();
  });
module.exports = router;