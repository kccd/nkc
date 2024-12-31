const Router = require('koa-router');
const router = new Router();
const { Public } = require('../../middlewares/permission');
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
  .use('/', Public(), async (ctx, next) => {
    const { query, data, db, state } = ctx;
    let { t } = query;
    if (t !== zoneTypes.article) {
      t = zoneTypes.moment;
    }
    data.zoneTypes = zoneTypes;
    data.t = t;
    data.pageTitle = `空间 - ${data.pageTitle}`;

    await db.MomentModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });

    await next();
  })
  // 动态
  .get('/', Public(), async (ctx, next) => {
    const { state, db, data, query, nkcModules, permission } = ctx;
    const { t, zoneTypes } = data;
    if (t !== zoneTypes.moment) {
      return await next();
    }
    const { page = 0 } = query;
    const momentStatus = await db.MomentModel.getMomentStatus();
    const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
    const { own, everyone, attention } =
      await db.MomentModel.getMomentVisibleType();
    const $or = [];
    // 当前人物自己的动态
    if (state.uid) {
      $or.push({
        uid: state.uid,
        status: {
          $in: [momentStatus.normal, momentStatus.faulty, momentStatus.unknown],
        },
        visibleType: {
          $in: [own, everyone, attention],
        },
      });
    }
    const match = {
      parent: '',
      $or,
      quoteType: {
        $in: ['', momentQuoteTypes.moment],
        // $in: ['', momentQuoteTypes.article, momentQuoteTypes.moment],
      },
    };
    //判断是否当前用有相应证书可以查看所有内容,或设置电文可见状态
    const hasPermission =
      ctx.permission('setMomentVisibleOther') ||
      ctx.permission('viewOtherUserAbnormalMoment');
    if (hasPermission) {
      match.$or.push({
        status: {
          $in: [momentStatus.normal],
        },
        visibleType: {
          $in: [own, everyone, attention],
        },
      });
    }
    //获取当前用户的关注列表
    const subUid = await db.SubscribeModel.getUserSubUsersId(state.uid);
    const condition = {
      uid: {
        $in: subUid,
      },
      status: momentStatus.normal,
    };
    //查看全部
    match.$or.push(
      //所有人可见
      {
        status: momentStatus.normal,
        visibleType: {
          $in: [everyone],
        },
      },
      //仅关注可见
      {
        ...condition,
        visibleType: {
          $in: [attention],
        },
      },
    );
    if (ctx.permission('managementMoment')) {
      match.$or.push({
        status: {
          $in: [
            momentStatus.disabled,
            momentStatus.faulty,
            momentStatus.unknown,
          ],
        },
        visibleType: {
          $in: [own, everyone, attention],
        },
      });
    }
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
    ctx.remoteTemplate = 'latest/zone/moment.pug';
    await next();
  })
  .get('/', Public(), async (ctx, next) => {
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
    ctx.remoteTemplate = 'latest/zone/article.pug';
    await next();
  });
module.exports = router;
