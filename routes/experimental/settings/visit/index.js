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
    const {globalLimitVisitor, userHomeLimitVisitor} = body.visitSettings;
    nkcModules.checkData.checkString(globalLimitVisitor.description, {
      name: '全局游客限制 - 提示内容',
      maxLength: 100000,
    });
    nkcModules.checkData.checkString(globalLimitVisitor.description, {
      name: '用户名片页游客限制 - 提示内容',
      maxLength: 100000,
    });
    await db.SettingModel.updateOne({_id: 'visit'}, {
      $set: {
        "c.globalLimitVisitor": {
          status: !!globalLimitVisitor.status,
          description: globalLimitVisitor.description
        },
        "c.userHomeLimitVisitor": {
          status: !!userHomeLimitVisitor.status,
          description: userHomeLimitVisitor.description
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis('visit');
    await next();
  });
module.exports = router;