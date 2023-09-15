const Router = require('koa-router');
const router = new Router();
const {
  communityCountService,
} = require('../../services/community/communityCount.service');
const {
  subscribeForumService,
} = require('../../services/subscribe/subscribeForum.service');
const { userForumService } = require('../../services/user/userForum.service');
router
  // 访问控制，判断后台是否禁用了社区的访问
  .use('/', async (ctx, next) => {
    const { state, db, data } = ctx;
    await db.ForumModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .use('/', async (ctx, next) => {
    const { db, data } = ctx;
    const { user } = data;
    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      user,
    );
    // 最新文章贴序
    const latestThreads = await db.ThreadModel.getLatestThreads(
      fidOfCanGetThreads,
      'toc',
      9,
    );
    data.latestThreads = await db.ThreadModel.extendCommunityThreadList(
      latestThreads,
    );

    // 最新文章复序
    const latestPostThreads = await db.ThreadModel.getLatestThreads(
      fidOfCanGetThreads,
      'tlm',
      9,
    );
    data.latestPostThreads = await db.ThreadModel.extendCommunityThreadList(
      latestPostThreads,
    );

    // 首页推荐文章（轮播图、6宫格图）
    data.ads = await db.ThreadModel.getHomeRecommendThreads(fidOfCanGetThreads);
    // 论坛总版的帖子、回复的统计
    data.communityContentCount =
      await communityCountService.getCommunityContentCount();
    await next();
  })
  .get('/', async (ctx, next) => {
    const { db, data } = ctx;
    const { user } = data;
    const toolSettings = await db.SettingModel.getSettings('tools');
    const homeSettings = await db.SettingModel.getSettings('home');
    // 专业导航
    const forumsTree = await db.ForumModel.getForumsTreeLevel2(
      data.userRoles,
      data.userGrade,
      data.user,
    );
    const forumsObj = {};
    forumsTree.map((f) => {
      const { categoryId } = f;
      if (!forumsObj[categoryId]) {
        forumsObj[categoryId] = [];
      }
      forumsObj[categoryId].push(f);
    });
    data.categoryForums = await db.ForumModel.getUserCategoriesWithForums({
      user: data.user,
      userRoles: data.userRoles,
      userGrade: data.userGrade,
      limitLevel: true,
    });

    // 是否启用了基金
    const { enableFund, fundName } = await db.SettingModel.getSettings('fund');
    if (enableFund) {
      // 基金名称
      data.fundName = fundName;
      // 基金申请
      const queryOfFunding = {
        disabled: false,
        'status.adminSupport': true,
        'status.completed': { $ne: true },
      };
      const funding = await db.FundApplicationFormModel.find(queryOfFunding)
        .sort({ toc: -1 })
        .limit(5);
      data.fundApplicationForms = [];
      for (const a of funding) {
        await a.extendFund();
        if (a.fund) {
          await a.extendApplicant({
            extendSecretInfo: false,
          });
          await a.extendProject();
          data.fundApplicationForms.push(a);
        }
      }
    }
    data.enableFund = enableFund;

    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      user,
    );

    // 获取与用户有关的数据
    if (user) {
      data.subscribeForums =
        await subscribeForumService.getSubscribeForumsFromCache(user.uid);
      data.visitedForums = await userForumService.getVisitedForumsFromCache(
        user.uid,
        10,
      );
    }

    //最新加学术分文章
    data.academicThread = await db.ThreadModel.getNewAcademicThread(
      fidOfCanGetThreads,
    );
    // 社区置顶
    data.communityToppedThreads =
      await db.ThreadModel.getCommunityToppedThreads(fidOfCanGetThreads);
    // 最新原创文章
    data.originalThreads = await db.ThreadModel.getOriginalThreads(
      fidOfCanGetThreads,
    );
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
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(
      fidOfCanGetThreads,
    );
    // 精选
    data.digestThreads = await db.ThreadModel.extendCommunityThreadList(
      data.featuredThreads,
    );
    // 含有最新回复的文章
    data.latestPosts = await db.PostModel.getLatestPosts(fidOfCanGetThreads, 6);
    // 拓展管理未读条数
    data.managementData = await db.SettingModel.getManagementData(data.user);
    // 应用列表
    data.appsData = await db.SettingModel.getAppsData();
    // 用户资料补全提示
    data.improveUserInfo =
      await db.UserModel.getImproveUserInfoByMiddlewareUser(data.user);

    data.navbar_highlight = 'community';
    ctx.template = 'community/community.pug';
    await next();
  });
module.exports = router;
