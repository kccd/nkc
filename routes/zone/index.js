const router = require('koa-router')();
const articleRouter = require('./article');
const momentRouter = require('./moment');
const zoneTypes = {
  moment: 'moment',
  article: 'article',
};

// 缓存动态总条数
const momentsCount = {
  number: 0, // 数据数目
  timestamp: 0, // 更新时间 ms
  interval: 30 * 60 * 1000, // 有效时间 ms
};
router
  .use('/', async (ctx, next) => {
    const { data, db, state, internalData } = ctx;
    let visitedForums = [];
    if (data.user) {
      let visitedForumsId = await db.UsersGeneralModel.getUserVisitedForumsId(
        data.user.uid,
      );
      visitedForumsId = visitedForumsId.slice(0, 5);
      visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId);
    }

    const serverSettings = await db.SettingModel.getSettings('server');
    const pageTitle = `${serverSettings.websiteName}`;

    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user,
    );

    // 筛选出没有开启流控的专业
    let forumInReduceVisits = await db.ForumModel.find(
      { openReduceVisits: true },
      { fid: 1 },
    );
    forumInReduceVisits = forumInReduceVisits.map((forum) => forum.fid);
    fidOfCanGetThreads = fidOfCanGetThreads.filter(
      (fid) => !forumInReduceVisits.includes(fid),
    );
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(
      fidOfCanGetThreads,
    );
    data.recommendThreads = await db.ThreadModel.getRecommendThreads(
      fidOfCanGetThreads,
    );
    data.noticeThreads = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    data.managementData = await db.SettingModel.getManagementData(data.user);
    data.appsData = await db.SettingModel.getAppsData();
    data.homeBigLogo = await db.SettingModel.getHomeBigLogo();
    data.visitedForums = visitedForums;
    data.categoriesWithForums = await db.ForumModel.getUserCategoriesWithForums(
      {
        user: data.user,
        userRoles: data.userRoles,
        userGrade: data.userGrade,
      },
    );
    data.subscribeForums = [];
    if (state.uid) {
      data.subscribeForums = await db.ForumModel.getUserSubForums(
        state.uid,
        fidOfCanGetThreads,
      );
    }
    data.improveUserInfo =
      await db.UserModel.getImproveUserInfoByMiddlewareUser(data.user);
    data.permissions = {
      isSuperModerator: ctx.permission('superModerator'),
    };
    data.pageTitle = pageTitle;
    internalData.fidOfCanGetThreads = fidOfCanGetThreads;

    // data.navbar = {
    //   highlight: 'latest',
    // };

    // 新用户
    data.newUsers = await db.ActiveUserModel.getNewUsersFromCache();

    await next();
  })
  .use('/', async (ctx, next) => {
    const { query, db, data, state } = ctx;
    let { t } = query;
    if (t !== zoneTypes.article) {
      t = zoneTypes.moment;
    }
    data.zoneTypes = zoneTypes;
    data.t = t;
    data.pageTitle = `电波 - ${data.pageTitle}`;
    data.navbar_highlight = 'zone';
    await db.MomentModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .get('/', async (ctx, next) => {
    const { state, db, data, query, nkcModules, permission } = ctx;
    const { t, zoneTypes } = data;
    if (t !== zoneTypes.moment) {
      return await next();
    }

    const { page = 0 } = query;
    const momentStatus = await db.MomentModel.getMomentStatus();
    const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
    const $or = [
      {
        status: momentStatus.normal,
      },
    ];
    // 当前人物自己的动态
    if (state.uid) {
      $or.push({
        uid: state.uid,
        status: {
          $in: [momentStatus.normal, momentStatus.faulty, momentStatus.unknown],
        },
      });
    }
    const match = {
      parent: '',
      $or,
      quoteType: {
        $in: ['', momentQuoteTypes.article, momentQuoteTypes.moment],
      },
    };
    //获取当前用户对动态的审核权限
    const permissions = {
      reviewed: null,
    };
    if (state.uid) {
      if (permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.reviewed = true;
      }
    }
    let count;
    const now = Date.now();
    if (now - momentsCount.timestamp > momentsCount.interval) {
      count = await db.MomentModel.countDocuments(match);
      momentsCount.number = count;
      momentsCount.timestamp = now;
    } else {
      count = momentsCount.number;
    }
    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match)
      .sort({ top: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsListData(
      moments,
      state.uid,
    );
    data.paging = paging;
    data.permissions = permissions;
    ctx.remoteTemplate = 'zone/zone/moment.pug';
    await next();
  })
  .get('/', async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    const { t, zoneTypes } = data;
    if (t !== zoneTypes.article) {
      return await next();
    }

    const { page = 0 } = query;
    const articleStatus = await db.ArticleModel.getArticleStatus();
    const articleSources = await db.ArticleModel.getArticleSources();
    const match = {
      status: articleStatus.normal,
      source: articleSources.zone,
    };
    const count = await db.ArticleModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const articles = await db.ArticleModel.find(match)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const pageSettings = await db.SettingModel.getSettings('page');
    data.latestZoneArticlePanelStyle =
      pageSettings.articlePanelStyle.latestZone;
    data.articlesPanelData = await db.ArticleModel.extendArticlesPanelData(
      articles,
    );
    data.paging = paging;
    ctx.remoteTemplate = 'zone/zone/article.pug';
    await next();
  })
  .use('/m', momentRouter.routes(), momentRouter.allowedMethods())
  .use('/a', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;
