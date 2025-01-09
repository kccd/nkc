const { Public } = require('../../../../middlewares/permission');

const router = require('koa-router')();
router.get('/', Public(), async (ctx, next) => {
  const { db, data, nkcModules } = ctx;
  const homeSettings = await db.SettingModel.getSettings('home');
  const fundSettings = await db.SettingModel.getSettings('fund');
  const toolSettings = await db.SettingModel.getSettings('tools');
  const fundInfo = {
    name: fundSettings.fundName,
    enabled: fundSettings.enableFund,
  };
  const activityInfo = {
    enabled: !!homeSettings.showActivityEnter,
  };
  const toolInfo = {
    enabled: toolSettings.enabled,
  };
  const categoryForums = await db.ForumModel.getUserCategoriesWithForums({
    user: data.user,
    userRoles: data.userRoles,
    userGrade: data.userGrade,
    limitLevel: false,
  });

  for (const category of categoryForums) {
    for (const forum of category.forums) {
      forum.src = nkcModules.tools.getUrl('forumHome', forum.fid);
      for (const childForum of forum.childrenForums) {
        childForum.src = nkcModules.tools.getUrl('forumHome', childForum.fid);
      }
    }
  }

  const managementInfo = await db.SettingModel.getManagementData(data.user);

  ctx.apiData = {
    categoryForums,
    managementInfo,
    permission: {
      fundInfo,
      activityInfo,
      toolInfo,
    },
  };
  await next();
});
module.exports = router;
