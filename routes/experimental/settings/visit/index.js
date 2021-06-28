const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.visitSettings = await db.SettingModel.getSettings('visit');
    ctx.template = 'experimental/settings/visit/visit.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {status, description} = body.visitSettings.limitVisitor;
    console.log(body.visitSettings);
    nkcModules.checkData.checkString(description, {
      name: '提示内容',
      maxLength: 100000,
    });
    await db.SettingModel.updateOne({_id: 'visit'}, {
      $set: {
        "c.limitVisitor": {
          status: !!status,
          description
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis('visit');
    await next();
  });
module.exports = router;