const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {state, db, data} = ctx;
    await db.ForumModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map(r => r._id),
      gradeId: state.uid? data.userGrade._id: undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .get('/', async (ctx, next) => {
    const {db, data, state, nkcModules} = ctx;
    data.threadPostList = state.pageSettings.threadPostList;
    data.websiteName = state.serverSettings.websiteName;
    data.threadListStyle = state.threadListStyle;
    data.anonymousUserAvatar = nkcModules.tools.getUrl("anonymousUserAvatar")
    const {user} = data;
    const toolSettings = await db.SettingModel.getSettings("tools");
    const homeSettings = await db.SettingModel.getSettings("home");
    // 专业导航
    const forumsTree = await db.ForumModel.getForumsTreeLevel2(data.userRoles, data.userGrade, data.user);
    const forumsObj = {};
    forumsTree.map(f => {
      const {categoryId} = f;
      if(!forumsObj[categoryId]) forumsObj[categoryId] = [];
      forumsObj[categoryId].push(f);
    });
    data.categoryForums = await db.ForumModel.getUserCategoriesWithForums({
      user: data.user,
      userRoles: data.userRoles,
      userGrade: data.userGrade,
      limitLevel: true,
    });
    data.categoryForums.forEach(cf => {
      cf.forums.forEach(forum => {
        if (forum.logo) {
          forum.logo = nkcModules.tools.getUrl('forumLogo', forum.logo)
        }
        if (forum.childrenForums.length) {
          forum.childrenForums.forEach(item => {
            item.logo = nkcModules.tools.getUrl('forumLogo', item.logo)
          })
        }
      })
    })
    // 是否启用了基金
    const {enableFund, fundName} = await db.SettingModel.getSettings('fund');
    if(enableFund) {
      // 基金名称
      data.fundName = fundName;
      // 基金申请
      const queryOfFunding = {
        disabled: false,
        'status.adminSupport': true,
        'status.completed': {$ne: true}
      };
      const funding = await db.FundApplicationFormModel.find(queryOfFunding).sort({toc: -1}).limit(5);
  
      data.fundApplicationForms = [];
      for(const a of funding) {
        await a.extendFund();
        if(a.fund) {
          await a.extendApplicant({
            extendSecretInfo: false
          });
          await a.extendProject();
          const _a = a.toObject();
          _a.applicant.user.avatar = nkcModules.tools.getUrl("userAvatar", _a.applicant.user.avatar);
          data.fundApplicationForms.push(_a);
        }
      }
      data.fundApplicationForms.forEach(form => {

      })
    }
    data.enableFund = enableFund;

    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      user
    );

    // 获取与用户有关的数据
    if(user) {
      const subForumsId = await db.SubscribeModel.getUserSubForumsId(user.uid);
      const forums = await db.ForumModel.find({fid: {$in: subForumsId}});
      const forumsObj = {};
      forums.map(f => forumsObj[f.fid] = f);
      data.subForums = [];
      // 查出此用户已关注的专业
      for(let fid of subForumsId) {
        const forum = forumsObj[fid];
        if(!forum) continue;
        if (homeSettings.subscribesDisplayMode === "column") {
          forum.latestThreads = await db.ForumModel.getLatestThreadsFromRedis(forum.fid);
        }
        forum.logoUrl = nkcModules.tools.getUrl("forumLogo", forum.logo)
        data.subForums.push(forum);
      }
    }
    // 社区置顶
    // 1
    data.communityToppedThreads = await db.ThreadModel.getCommunityToppedThreads(fidOfCanGetThreads);
    data.communityToppedThreads.forEach(thread => {
      // thread.user.avatarUrl = nkcModules.tools.getUrl('userAvatar', thread.user.avatar, 'sm');
      thread.firstPost.briefTime = nkcModules.tools.briefTime(thread.firstPost.toc);
      thread.lastPost.briefTime = nkcModules.tools.briefTime(thread.lastPost.toc);
      thread.lastPost.user.avatar = nkcModules.tools.getUrl("userAvatar", thread.lastPost.user.avatar, "sm");
      thread.firstPost.cover = nkcModules.tools.getUrl('postCover', (thread.firstPost ? thread.firstPost.cover : '') || (thread.document ? thread.document.cover : ''));
      thread.firstPost.user.avatar = nkcModules.tools.getUrl('userAvatar', thread.firstPost.user.avatar, 'sm');
    })
    // 最新原创文章
    // 2
    data.originalThreads = await db.ThreadModel.getOriginalThreads(fidOfCanGetThreads);
    data.originalThreads.forEach(thread => {
      // thread.user.avatarUrl = nkcModules.tools.getUrl('userAvatar', thread.user.avatar, 'sm');
      thread.firstPost.briefTime = nkcModules.tools.briefTime(thread.firstPost.toc);
      thread.lastPost.briefTime = nkcModules.tools.briefTime(thread.lastPost.toc);
      thread.lastPost.user.avatar = nkcModules.tools.getUrl("userAvatar", thread.lastPost.user.avatar, "sm");
      thread.firstPost.cover = nkcModules.tools.getUrl('postCover', (thread.firstPost ? thread.firstPost.cover : '') || (thread.document ? thread.document.cover : ''));
      thread.firstPost.user.avatar = nkcModules.tools.getUrl('userAvatar', thread.firstPost.user.avatar, 'sm');
    })
    /*// 最新文章
    data.latestThreads = await db.ThreadModel.getLatestThreads(fidOfCanGetThreads, "toc", 3);*/
    // 最近活跃用户
    data.activeUsers = await db.ActiveUserModel.getActiveUsersFromCache();
    // 首页大Logo
    data.homeBigLogo = await db.SettingModel.getHomeBigLogo();
    // 公告通知
    data.notices = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    // 是否启用了网站工具
    data.siteToolEnabled = toolSettings.enabled;
    // 是否显示“活动”入口
    data.showActivityEnter = homeSettings.showActivityEnter;
    // 关注专业的显示风格
    data.subscribesDisplayMode = homeSettings.subscribesDisplayMode;
    // 推荐 精选文章
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);
    data.featuredThreads.forEach(thread => {
      thread.firstPost.cover = nkcModules.tools.getUrl("postCover", thread.firstPost.cover);
      if (!thread.firstPost.anonymous) {
        thread.firstPost.user.avatar = nkcModules.tools.getUrl("userAvatar", thread.firstPost.user.avatar)
      }
    })
    // 含有最新回复的文章
    data.latestPosts = await db.PostModel.getLatestPosts(fidOfCanGetThreads, 6);
    data.latestPosts.forEach(post => {
      if (post.user.avatar) {
        post.user = post.user.toObject()
        post.user.avatar = nkcModules.tools.getUrl("userAvatar", post.user.avatar);
      }
      if (post.targetUser.avatar) {
        post.targetUserAvatar = nkcModules.tools.getUrl("userAvatar", post.targetUser.avatar);
      }
    })
  
    // 拓展管理未读条数
    data.managementData = await db.SettingModel.getManagementData(data.user);
    // 应用列表
    data.appsData = await db.SettingModel.getAppsData();
    // 用户资料补全提示
    data.improveUserInfo = await db.UserModel.getImproveUserInfoByMiddlewareUser(data.user);
    data.navbar_highlight = 'community';
    // ctx.template = 'community/community.pug';
    ctx.remoteTemplate = 'community/community.pug';
    await next();
  })
module.exports = router;
