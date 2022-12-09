const router = require('koa-router')();
const zoneRouter = require('./zone');
const communityRouter = require('./community');
const columnRouter = require('./column');
router
  .get('/', async (ctx) => {
    return ctx.redirect('/n/community');
  })
  .use('/', async (ctx, next) => {
    const {data, db, state, internalData} = ctx;
    let visitedForums = [];
    if(data.user) {
      let visitedForumsId = await db.UsersGeneralModel.getUserVisitedForumsId(data.user.uid);
      visitedForumsId = visitedForumsId.slice(0, 5);
      visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId);
    }

    const serverSettings = await db.SettingModel.getSettings('server');
    const pageTitle = `${serverSettings.websiteName}`;

    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user
    );

    // 筛选出没有开启流控的专业
    let forumInReduceVisits = await db.ForumModel.find({openReduceVisits: true}, {fid: 1});
    forumInReduceVisits = forumInReduceVisits.map(forum => forum.fid);
    fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !forumInReduceVisits.includes(fid));
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);
    data.recommendThreads = await db.ThreadModel.getRecommendThreads(fidOfCanGetThreads);
    data.noticeThreads = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    data.managementData = await db.SettingModel.getManagementData(data.user);
    data.appsData = await db.SettingModel.getAppsData();
    data.homeBigLogo = await db.SettingModel.getHomeBigLogo();
    data.visitedForums = visitedForums;
    data.categoriesWithForums = await db.ForumModel.getUserCategoriesWithForums({
      user: data.user,
      userRoles: data.userRoles,
      userGrade: data.userGrade,
    });
    data.subscribeForums = [];
    if(state.uid) {
      data.subscribeForums = await db.ForumModel.getUserSubForums(state.uid, fidOfCanGetThreads);
    }
    data.improveUserInfo = await db.UserModel.getImproveUserInfoByMiddlewareUser(data.user);
    data.permissions = {
      isSuperModerator: ctx.permission("superModerator")
    };
    data.pageTitle = pageTitle
    internalData.fidOfCanGetThreads = fidOfCanGetThreads;

    data.navbar = {
      highlight: 'latest'
    };

    // 新用户
    data.newUsers = await db.ActiveUserModel.getNewUsersFromCache();

    await next();
  })
  .use('/zone', zoneRouter.routes(), zoneRouter.allowedMethods())
  .use('/community', communityRouter.routes(), communityRouter.allowedMethods())
  .use('/column', columnRouter.routes(), columnRouter.allowedMethods());
module.exports = router;
