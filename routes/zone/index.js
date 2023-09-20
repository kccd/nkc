const router = require('koa-router')();
const { ThrowForbiddenResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const articleRouter = require('./article');
const momentRouter = require('./moment');
const zoneTypes = {
  moment: 'moment',
  article: 'article',
};

const zoneTab = {
  all: 'all',
  subscribe: 'subscribe',
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
    data.isLogin = state.uid ? true : false;
    // let visitedForums = [];
    // if (data.user) {
    //   let visitedForumsId = await db.UsersGeneralModel.getUserVisitedForumsId(
    //     data.user.uid,
    //   );
    //   visitedForumsId = visitedForumsId.slice(0, 5);
    //   visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId);
    // }

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
    // data.visitedForums = visitedForums;
    // data.categoriesWithForums = await db.ForumModel.getUserCategoriesWithForums(
    //   {
    //     user: data.user,
    //     userRoles: data.userRoles,
    //     userGrade: data.userGrade,
    //   },
    // );
    // data.subscribeForums = [];
    // if (state.uid) {
    //   data.subscribeForums = await db.ForumModel.getUserSubForums(
    //     state.uid,
    //     fidOfCanGetThreads,
    //   );
    // }
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
    let flag = false;
    for (let tab in zoneTab) {
      for (let type in zoneTypes) {
        if (`${tab}-${type}` === t) {
          flag = true;
        }
      }
    }
    if (!flag) {
      t = `${zoneTab.all}-${zoneTypes.moment}`;
    }
    // if (t !== zoneTypes.article) {
    //   t = `${zoneTab.all}-${zoneTypes.moment}`;
    // }
    data.zoneTypes = zoneTypes;
    data.t = t;
    data.zoneTab = zoneTab;
    data.pageTitle = `电波 - ${data.pageTitle}`;
    data.navbar_highlight = 'zone';
    ctx.template = 'zone/zone.pug';
    await db.MomentModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });
    // 未登录
    if (t.split('-')[0] === zoneTab.subscribe && !state.uid) {
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
    }
    await next();
  })
  .get('/', async (ctx, next) => {
    const { state, db, data, query, nkcModules, permission } = ctx;
    const { t, zoneTypes, zoneTab } = data;
    if (t.split('-')[1] !== zoneTypes.moment) {
      return await next();
    }
    // 关注
    const subUid = await db.SubscribeModel.getUserSubUsersId(state.uid);
    subUid.push(state.uid);
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

    const match =
      t.split('-')[0] === zoneTab.subscribe && state.uid
        ? {
            parent: '',
            uid: { $in: subUid },
            $or,
            quoteType: {
              $in: ['', momentQuoteTypes.article, momentQuoteTypes.moment],
            },
          }
        : {
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
    // let count;
    // const now = Date.now();
    // if (now - momentsCount.timestamp > momentsCount.interval) {
    //   count = await db.MomentModel.countDocuments(match);
    //   momentsCount.number = count;
    //   momentsCount.timestamp = now;
    // } else {
    //   count = momentsCount.number;
    // }
    const count = await db.MomentModel.countDocuments(match);

    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel.find(match)
      .sort({ top: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsListData(
      moments,
      state.uid,
    );
    // console.log('2222', count, '33333', paging);

    data.paging = paging;
    data.permissions = permissions;
    // ctx.remoteTemplate = 'zone/zone/moment.pug';
    await next();
  })
  .get('/', async (ctx, next) => {
    const { data, db, query, nkcModules, state } = ctx;
    const { t, zoneTypes } = data;
    if (t.split('-')[1] !== zoneTypes.article) {
      return await next();
    }
    // 关注
    const subUid = await db.SubscribeModel.getUserSubUsersId(state.uid);
    subUid.push(state.uid);
    const { page = 0 } = query;
    const articleStatus = await db.ArticleModel.getArticleStatus();
    const articleSources = await db.ArticleModel.getArticleSources();
    const match =
      t.split('-')[0] === zoneTab.subscribe && state.uid
        ? {
            uid: { $in: subUid },
            status: articleStatus.normal,
            source: articleSources.zone,
          }
        : {
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
    // console.log('666', data.articlesPanelData);

    data.paging = paging;
    // ctx.remoteTemplate = 'zone/zone/article.pug';
    await next();
  })
  .use('/m', momentRouter.routes(), momentRouter.allowedMethods())
  .use('/a', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;
