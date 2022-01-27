const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.roles = await db.RoleModel.find({_id: {$nin: ['default', 'dev']}}, {_id: 1, displayName: 1});
    data.grades = await db.UsersGradeModel.find({}, {_id: 1, displayName: 1});
    data.visitSettings = await db.SettingModel.getSettings('visit');
    ctx.template = 'experimental/settings/visit/visit.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {userHomeLimitVisitor, globalAccessLimit} = body.visitSettings;
    nkcModules.checkData.checkString(globalAccessLimit.userDescription, {
      name: '全局访问限制 - 登录用户提示内容',
      maxLength: 100000,
    });
    nkcModules.checkData.checkString(globalAccessLimit.visitorDescription, {
      name: '全局访问限制 - 游客提示内容',
      maxLength: 100000,
    });
    nkcModules.checkData.checkString(userHomeLimitVisitor.description, {
      name: '游客用户名片访问限制 - 提示内容',
      maxLength: 100000,
    });
    const roles = await db.RoleModel.find({_id: {$nin: ['default', 'dev']}}, {_id: 1, displayName: 1});
    const grades = await db.UsersGradeModel.find({}, {_id: 1, displayName: 1});
    const rolesId = roles.map(r => r._id);
    const gradesId = grades.map(g => g._id);
    const {whitelist} = globalAccessLimit;
    whitelist.rolesId = whitelist.rolesId.filter(id => rolesId.includes(id));
    whitelist.gradesId = whitelist.gradesId.filter(id => gradesId.includes(id));
    if(!['or', 'and'].includes(whitelist.relation)) {
      ctx.throw(400, `全局访问限制白名单关系设置错误 relation=${whitelist.relation}`);
    }
    await db.SettingModel.updateOne({_id: 'visit'}, {
      $set: {
        "c.userHomeLimitVisitor": {
          status: !!userHomeLimitVisitor.status,
          description: userHomeLimitVisitor.description
        },
        "c.globalAccessLimit": {
          status: !!globalAccessLimit.status,
          userDescription: globalAccessLimit.userDescription,
          visitorDescription: globalAccessLimit.visitorDescription,
          whitelist: {
            relation: whitelist.relation,
            rolesId: whitelist.rolesId,
            gradesId: whitelist.gradesId
          }
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis('visit');
    await next();
  });
module.exports = router;