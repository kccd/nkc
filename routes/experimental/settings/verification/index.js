const router = require('koa-router')();
const verifications = require('../../../../nkcModules/verification');
const types = Object.keys(verifications);
router
  .get('/', async (ctx, next) => {
    const { data, db } = ctx;
    data.verificationSettings = await db.SettingModel.getSettings(
      'verification',
    );
    // console.log('2222', data.verificationSettings);

    data.verificationTypes = [];
    for (const type of types) {
      data.verificationTypes.push({
        type,
        name: ctx.state.lang('verificationTypes', type),
      });
    }
    ctx.template = 'experimental/settings/verification/verification.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const { db, body, nkcModules } = ctx;
    const { enabledTypes, login, register, countLimit } =
      body.verificationSettings;
    const { checkNumber } = nkcModules.checkData;
    console.log('5555', body.verificationSettings);

    if (!types.includes(login.type) && login.enabled) {
      return ctx.throw(400, `登录验证类型错误 type: ${login.type}`);
    }
    if (!types.includes(register.type) && register.enabled) {
      return ctx.throw(400, `注册验证类型错误 type: ${register.type}`);
    }
    checkNumber(countLimit.time, {
      name: '时间',
      min: 1,
      fractionDigits: 2,
    });
    checkNumber(countLimit.count, {
      name: '次数',
      min: 1,
    });
    await db.SettingModel.updateOne(
      { _id: 'verification' },
      {
        $set: {
          // 'c.enabledTypes': enabledTypes,
          'c.countLimit': countLimit,
          'c.login': login,
          'c.register': register,
        },
      },
    );
    await db.SettingModel.saveSettingsToRedis('verification');
    // for (const t of enabledTypes) {
    //   if (!types.includes(t)) {
    //     ctx.throw(400, `验证类型错误 type: ${t}`);
    //   }
    // }
    // checkNumber(countLimit.time, {
    //   name: '时间',
    //   min: 1,
    //   fractionDigits: 2,
    // });
    // checkNumber(countLimit.count, {
    //   name: '次数',
    //   min: 1,
    // });
    // await db.SettingModel.updateOne(
    //   { _id: 'verification' },
    //   {
    //     $set: {
    //       'c.enabledTypes': enabledTypes,
    //       'c.countLimit': countLimit,
    //     },
    //   },
    // );
    // await db.SettingModel.saveSettingsToRedis('verification');
    await next();
  });
module.exports = router;
