const router = require('koa-router')();
router
  // 小屏左侧抽屉
  .get('/leftDraw', async (ctx, next) => {
    const { data, state, db, permission } = ctx;
    const homeSettings = await db.SettingModel.getSettings('home');
    // 是否启用了基金
    const fundSettings = await db.SettingModel.getSettings('fund');
    // 是否启用了网站工具
    const toolSettings = await db.SettingModel.getSettings('tools');
    //构建专业树
    data.forumsTree = await db.ForumModel.getForumsTree(
      data.userRoles,
      data.userGrade,
      data.user,
    );
    const forumsObj = {};
    data.forumsTree.map((f) => {
      const { categoryId } = f;
      if (!forumsObj[categoryId]) {
        forumsObj[categoryId] = [];
      }
      forumsObj[categoryId].push(f);
    });
    data.forumCategories = await db.ForumCategoryModel.getCategories();
    data.categoryForums = [];
    data.forumCategories.map((fc) => {
      const _fc = Object.assign({}, fc);
      const { _id } = _fc;
      _fc.forums = forumsObj[_id] || [];
      if (_fc.forums.length) {
        data.categoryForums.push(_fc);
      }
    });

    data.managementData = await db.SettingModel.getManagementData(data.user);
    data.permission = {
      fundSettings: fundSettings,
      hasUser: !!state.uid,
      showActivityEnter: homeSettings.showActivityEnter,
      siteToolEnabled: toolSettings.enabled,
      enableFund: fundSettings.enableFund,
      fundName: fundSettings.enableFund ? fundSettings.fundName : null,
    };
    await next();
  })
  // 小屏右侧抽屉
  .get('/userDraw', async (ctx, next) => {
    const { data, db, nkcModules } = ctx;
    const { user } = data;
    const { uid, username, info, avatar } = user;
    const {
      newSystemInfoCount,
      newApplicationsCount,
      newReminderCount,
      newUsersMessagesCount,
    } = await user.getNewMessagesCount();
    const newMessageCount =
      newSystemInfoCount +
      newApplicationsCount +
      newReminderCount +
      newUsersMessagesCount;
    data.drawState = {
      columnPermission: await db.UserModel.ensureApplyColumnPermission(
        data.user,
      ),
      uid,
      newMessageCount,
      userInfo: {
        avatar: nkcModules.tools.getUrl('userAvatar', avatar),
        name: username,
        certsName: await user.getCertsNameString(),
        scores: await db.UserModel.getUserScores(data.user.uid),
        userColumn: await db.UserModel.getUserColumn(data.user.uid),
        draftCount: data.user.draftCount,
      },
    };
    await next();
  })
  // 宽屏右侧用户卡片
  .get('/userNav', async (ctx, next) => {
    const { data, db, nkcModules } = ctx;
    const { user } = data;
    const {
      newSystemInfoCount,
      newApplicationsCount,
      newReminderCount,
      newUsersMessagesCount,
    } = await user.getNewMessagesCount();
    const newMessageCount =
      newSystemInfoCount +
      newApplicationsCount +
      newReminderCount +
      newUsersMessagesCount;
    const userScores = await db.UserModel.getUserScores(data.user.uid);
    const userColumn = await db.UserModel.getUserColumn(data.user.uid);
    const beta = (await db.DraftModel.getType()).beta;
    const userInfo = {
      banner: nkcModules.tools.getUrl('userBanner', data.user.banner),
      avatar: nkcModules.tools.getUrl('userAvatar', data.user.avatar),
      username: data.user.username,
      gradeColor: data.user.grade.color,
      gradeName: data.user.grade.displayName,
      certsName: await data.user.getCertsNameString(),
      scores: userScores
        ? userScores.map((score) => {
            score.icon = nkcModules.tools.getUrl('scoreIcon', score.icon);
            return score;
          })
        : [],
      xsf: data.user.xsf,
      columnId: userColumn ? userColumn._id : null,
      draftCount: await db.DraftModel.countDocuments({
        uid: data.user.uid,
        type: beta,
      }),
      gradeIcon: nkcModules.tools.getUrl('gradeIcon', data.user.grade._id),
    };
    data.anvState = {
      uid: data.user.uid,
      xsfIcon: nkcModules.tools.getUrl('defaultFile', 'xsf.png'),
      newMessageCount,
      userInfo,
      columnPermission: await db.UserModel.ensureApplyColumnPermission(
        data.user,
      ),
    };
    await next();
  });
module.exports = router;
