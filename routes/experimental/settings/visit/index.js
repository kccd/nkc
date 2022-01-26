const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.visitSettings = await db.SettingModel.getSettings('visit');
    data.certList = await db.RoleModel.getCertList(["dev"]);
    ctx.template = 'experimental/settings/visit/visit.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {globalLimitVisitor, userHomeLimitVisitor, globalAccessLimit} = body.visitSettings;
    nkcModules.checkData.checkString(globalAccessLimit.description, {
      name: '全局访问限制 - 提示内容',
      maxLength: 100000,
    });
    nkcModules.checkData.checkString(globalLimitVisitor.description, {
      name: '游客全局访问限制 - 提示内容',
      maxLength: 100000,
    });
    nkcModules.checkData.checkString(globalLimitVisitor.description, {
      name: '游客用户名片访问限制 - 提示内容',
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
        },
        "c.globalAccessLimit": {
          status: !!globalAccessLimit.status,
          description: globalAccessLimit.description,
          whitelist: globalAccessLimit.whitelist
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis('visit');
    await next();
  });
module.exports = router;