const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.rechargeSettings = await db.SettingModel.getSettings('recharge');
    ctx.template = 'experimental/settings/recharge/recharge.pug';
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {checkNumber} = nkcModules.checkData;
    const {recharge, withdraw} = body;
    console.log(recharge);
    console.log(withdraw);
    checkNumber(recharge.min, {
      name: '单次最小充值金额',
      min: 0,
    });
    checkNumber(recharge.max, {
      name: '单次最大充值金额',
      min: 0,
    });
    if(recharge.min > recharge.max) ctx.throw(400, '单次充值金额设置错误');
    checkNumber(recharge.aliPay.fee, {
      name: '支付宝充值手续费',
      min: 0,
      max: 1,
      fractionDigits: 4,
    });
    checkNumber(recharge.weChat.fee, {
      name: '微信充值手续费',
      min: 0,
      max: 1,
      fractionDigits: 4,
    });
    checkNumber(withdraw.min, {
      name: '单次最小提现金额',
      min: 0,
    });
    checkNumber(withdraw.max, {
      name: '单次最大提现金额',
      min: 0,
    });
    if(withdraw.min > withdraw.max) ctx.throw(400, '单次提现金额设置错误');
    checkNumber(withdraw.countOneDay, {
      name: '每天最大提现次数',
      min: 0,
    });
    checkNumber(withdraw.aliPay.fee, {
      name: '支付宝提现手续费',
      min: 0,
      max: 1,
      fractionDigits: 4,
    });
    checkNumber(withdraw.weChat.fee, {
      name: '微信提现手续费',
      min: 0,
      max: 1,
      fractionDigits: 4,
    });
    checkNumber(withdraw.startingTime, {
      name: '允许提现起始时间',
      min: 0,
      max: 24 * 60 * 60 * 1000
    });
    checkNumber(withdraw.endTime, {
      name: '允许提现结束时间',
      min: 0,
      max: 24 * 60 * 60 * 1000
    });
    if(withdraw.startingTime > withdraw.endTime) ctx.throw(400, '允许提现的时间段设置错误');
    await db.SettingModel.updateOne({_id: 'recharge'}, {
      $set: {
        'c.recharge': recharge,
        'c.withdraw': withdraw
      }
    });
    await db.SettingModel.saveSettingsToRedis('recharge');
    await next();
  });
module.exports = router;
