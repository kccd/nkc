const router = require("koa-router")();
router
  .get('/:uid', async (ctx, next) => {
    const {data, query, state, db, params, permission} = ctx;
    const {uid} = params;
    const homeSettings = await db.SettingModel.getSettings("home");
    // 是否启用了基金
    const fundSettings = await db.SettingModel.getSettings('fund');
    // 是否启用了网站工具
    const toolSettings = await db.SettingModel.getSettings("tools");
    //构建专业树
    data.forumsTree = await db.ForumModel.getForumsTree(
      data.userRoles,
      data.userGrade,
      data.user
    );
    const forumsObj = {};
    data.forumsTree.map(f => {
      const {categoryId} = f;
      if(!forumsObj[categoryId]) forumsObj[categoryId] = [];
      forumsObj[categoryId].push(f);
    });
    data.forumCategories = await db.ForumCategoryModel.getCategories();
    data.categoryForums = [];
    data.forumCategories.map(fc => {
      const _fc = Object.assign({}, fc);
      const {_id} = _fc;
      _fc.forums = forumsObj[_id] || [];
      if(_fc.forums.length) data.categoryForums.push(_fc);
    });
    data.permission = {
      nkcManagement: permission('nkcManagement'),
      visitExperimentalStatus: permission('visitExperimentalStatus'),
      review: permission('review'),
      complaintGet: permission('complaintGet'),
      visitProblemList: permission('visitProblemList'),
      getLibraryLogs: permission('getLibraryLogs'),
      fundSettings: fundSettings,
      hasUser: data.user?true:false,
      showActivityEnter: homeSettings.showActivityEnter,
      siteToolEnabled: toolSettings.enabled,
      enableFund: fundSettings.enableFund,
      fundName: fundSettings.enableFund?fundSettings.fundName:null,
    };
    await next();
  })
module.exports = router;
