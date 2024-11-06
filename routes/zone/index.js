const Router = require('koa-router');
const router = new Router();
const { OnlyUser } = require('../../middlewares/permission');
const articleRouter = require('./article');
const momentRouter = require('./moment');
const zoneTypes = {
  moment: 'm',
  article: 'a',
};

const zoneTab = {
  all: 'a',
  subscribe: 's',
};

const onlyUserPermission = OnlyUser();

// 缓存动态总条数
const momentsCount = {
  number: 0, // 数据数目
  timestamp: 0, // 更新时间 ms
  interval: 3 * 60 * 1000, // 有效时间 ms
};

router
  .use('/', async (ctx, next) => {
    const { db, state, data } = ctx;
    await db.MomentModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .get('/', async (ctx, next) => {
    const { query, data, state } = ctx;
    const { t = '' } = query;
    const [type, tab] = t.split('-');

    data.type = type || zoneTypes.moment;
    data.tab = tab || zoneTab.all;

    if (
      !Object.values(zoneTypes).includes(data.type) ||
      !Object.values(zoneTab).includes(data.tab)
    ) {
      ctx.throw(400, '参数异常');
    }

    data.t = t;
    data.zoneTypes = zoneTypes;
    data.zoneTab = zoneTab;
    data.currentPage = 'Zone';
    ctx.template = 'zone/zone.pug';

    if (data.tab === zoneTab.subscribe && !state.uid) {
      await onlyUserPermission(ctx, next);
    } else {
      await next();
    }
  })
  .get('/', async (ctx, next) => {
    const { state, db, data, query, nkcModules, permission } = ctx;
    const { zoneTypes, zoneTab, type, tab } = data;
    const { page = 0 } = query;
    if (type !== zoneTypes.moment) {
      return await next();
    }
    const momentStatus = await db.MomentModel.getMomentStatus();
    const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
    const { own, everyone, attention } =
      await db.MomentModel.getMomentVisibleType();
    const match = {
      parent: '',
      quoteType: {
        $in: ['', momentQuoteTypes.moment],
        // $in: ['', momentQuoteTypes.article, momentQuoteTypes.moment],
      },
      $or: [],
    };
    //判断是否当前用有相应证书可以查看所有内容,或设置电文可见状态
    const hasPermission =
      ctx.permission('setMomentVisibleOther') ||
      ctx.permission('viewOtherUserAbnormalMoment');
    //获取当前用户的电文
    if (state.uid) {
      match.$or.push({
        uid: state.uid,
        status: {
          $in: [momentStatus.normal, momentStatus.faulty, momentStatus.unknown],
        },
        visibleType: {
          $in: [own, everyone, attention],
        },
      });
    }
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
    if (tab === zoneTab.all) {
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
    } else {
      //查看关注
      match.$or.push({
        ...condition,
        visibleType: {
          $in: [everyone, attention],
        },
      });
      data.subUid = subUid;
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
    //缓存
    if (tab === zoneTab.all) {
      const now = Date.now();
      if (now - momentsCount.timestamp > momentsCount.interval) {
        count = await db.MomentModel.countDocuments(match);
        momentsCount.number = count;
        momentsCount.timestamp = now;
      } else {
        count = momentsCount.number;
      }
    } else {
      count = await db.MomentModel.countDocuments(match);
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
    await next();
  })
  .get('/', async (ctx, next) => {
    const { data, db, query, nkcModules, state } = ctx;
    const { zoneTypes, type, tab } = data;
    if (type !== zoneTypes.article) {
      return await next();
    }
    const articleStatus = await db.ArticleModel.getArticleStatus();
    const articleSources = await db.ArticleModel.getArticleSources();

    const match = {
      status: articleStatus.normal,
      source: articleSources.zone,
    };

    const { page = 0 } = query;

    if (tab === zoneTab.subscribe) {
      const subUid = await db.SubscribeModel.getUserSubUsersId(state.uid);
      subUid.push(state.uid);
      match.uid = {
        $in: subUid,
      };
    }

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
    await next();
  })
  .get(['/editor/rich', '/editor/rich/history'], async (ctx, next) => {
    ctx.remoteTemplate = 'zone/zone.pug';
    await next();
  })
  .use('/m', momentRouter.routes(), momentRouter.allowedMethods())
  .use('/a', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;
