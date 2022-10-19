const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.roles = await db.RoleModel.find({_id: {$nin: ['default', 'dev']}}, {_id: 1, displayName: 1});
    data.grades = await db.UsersGradeModel.find({}, {_id: 1, displayName: 1}).sort({_id: 1});
    data.accessControl = await db.AccessControlModel.getAllAccessControlDetail();
    ctx.template = 'experimental/settings/visit/visit.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {accessControl} = body;
    const roles = await db.RoleModel.find({_id: {$nin: ['default', 'dev']}}, {_id: 1, displayName: 1});
    const grades = await db.UsersGradeModel.find({}, {_id: 1, displayName: 1});
    const rolesId = roles.map(r => r._id);
    const gradesId = grades.map(g => g._id);
    const sourcesName = {
      column: '专栏',
      zone: '空间',
      community: '社区',
      fund: '基金',
      global: '全局',
      user: '用户名片',
      search: '搜索',
    };

    const checkAndModifyAC = (source, acForm) => {
      const {userDesc, visitorDesc, whitelist} = acForm;
      nkcModules.checkData.checkString(userDesc, {
        name: `${sourcesName[source]} 访问控制用户提示`,
        minLength: 1,
        maxLength: 10000
      });
      nkcModules.checkData.checkString(visitorDesc, {
        name: `${sourcesName[source]} 访问控制游客提示`,
        minLength: 1,
        maxLength: 10000
      });
      whitelist.rolesId = whitelist.rolesId.filter(roleId => rolesId.includes(roleId));
      whitelist.gradesId = whitelist.gradesId.filter(gradeId => gradesId.includes(gradeId));
    }

    for(const ac of accessControl) {
      const {source, app, web} = ac;
      checkAndModifyAC(source, app);
      checkAndModifyAC(source, web);
    }

    for(const ac of accessControl) {
      const {source, app, web} = ac;
      await db.AccessControlModel.updateOne({source}, {
        $set: {
          'app.enabled': app.enabled,
          'app.userDesc': app.userDesc,
          'app.visitorDesc': app.visitorDesc,
          'app.whitelist.rolesId': app.whitelist.rolesId,
          'app.whitelist.gradesId': app.whitelist.gradesId,
          'app.whitelist.relation': app.whitelist.relation,
          'app.whitelist.usersId': app.whitelist.usersId,

          'web.enabled': web.enabled,
          'web.userDesc': web.userDesc,
          'web.visitorDesc': web.visitorDesc,
          'web.whitelist.rolesId': web.whitelist.rolesId,
          'web.whitelist.gradesId': web.whitelist.gradesId,
          'web.whitelist.relation': web.whitelist.relation,
          'web.whitelist.usersId': web.whitelist.usersId,
        }
      });
    }
    await db.AccessControlModel.saveToCache();
    // await db.SettingModel.saveSettingsToRedis('visit');
    await next();
  });
module.exports = router;
