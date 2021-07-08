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
    const {checkString} = nkcModules.checkData;
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
      fundPoolDescription
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
        'c.fundPoolDescription': fundPoolDescription
      }
    });
    await db.SettingModel.saveSettingsToRedis('fund');
    await next();
  });
module.exports = router;