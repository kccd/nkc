const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const homeSettings = await db.SettingModel.getSettings("home");
    const fundSettings = await db.SettingModel.getSettings('fund');
    const toolSettings = await db.SettingModel.getSettings("tools");
    const fundInfo = {
      name: fundSettings.fundName,
      enabled: fundSettings.enableFund,
    };
    const activityInfo = {
      enabled: !!homeSettings.showActivityEnter,
    };
    const toolInfo = {
      enabled: toolSettings.enabled
    };
    const categoryForums = await db.ForumModel.getUserCategoriesWithForums({
      user: data.user,
      userRoles: data.userRoles,
      userGrade: data.userGrade,
      limitLevel: false,
    });
    const managementInfo = await db.SettingModel.getManagementData(data.user);
    ctx.apiData = {
      fundInfo,
      activityInfo,
      toolInfo,
      categoryForums,
      managementInfo,
    };
    await next();
  });
module.exports = router;
