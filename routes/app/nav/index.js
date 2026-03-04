const { OnlyUser } = require('../../../middlewares/permission');
const { appsService } = require('../../../services/apps/apps.service');
const router = require('koa-router')();
router.get('/', OnlyUser(), async (ctx, next) => {
  const { nkcModules, db, data } = ctx;
  data.code = await db.UserModel.getCode(data.user.uid);
  data.code = data.code.pop();
  ctx.template = 'app/nav/nav.pug';
  data.managementData = await db.SettingModel.getManagementData(data.user);
  data.appsData = (await appsService.getApps()).map((app) => {
    return {
      ...app,
      name: app.abbr || app.name,
    };
  });
  data.userCertsName = await data.user.getCertsNameString();
  data.userScores = await db.UserModel.getUserScoresInfo(data.user.uid);
  data.userColumn = await db.UserModel.getUserColumn(data.user.uid);
  data.columnPermission = await db.UserModel.ensureApplyColumnPermission(
    data.user,
  );
  await next();
});
module.exports = router;
