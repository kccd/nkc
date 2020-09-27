const router = require('koa-router')();
const verifications = require('../../../../nkcModules/verification');
const types = Object.keys(verifications);
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.verificationSettings = await db.SettingModel.getSettings('verification');
    data.verificationTypes = [];
    for(const type of types) {
      data.verificationTypes.push({
        type,
        name: ctx.state.lang('verificationTypes', type)
      });
    }
    ctx.template = 'experimental/settings/verification/verification.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {enabledTypes, countLimit} = body.verificationSettings;
    const {checkNumber} = nkcModules.checkData;
    for(const t of enabledTypes) {
      if(!types.includes(t)) ctx.throw(400, `验证类型错误 type: ${t}`);
    }
    checkNumber(countLimit.time, {
      name: '时间',
      min: 1,
      fractionDigits: 2
    });
    checkNumber(countLimit.count, {
      name: '次数',
      min: 1,
    });
    await db.SettingModel.updateOne({_id: 'verification'}, {
      $set: {
        'c.enabledTypes': enabledTypes,
        'c.countLimit': countLimit
      }
    });
    await db.SettingModel.saveSettingsToRedis('verification');
    await next();
  });
module.exports = router;
