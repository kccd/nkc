const Router = require('koa-router');
const router = new Router();
const { OnlyUser, Public } = require('../../middlewares/permission');
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
  .use('/', Public(), async (ctx, next) => {
    const { db, state, data } = ctx;
    await db.MomentModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .get('/', Public(), async (ctx, next) => {
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
  .get('/', Public(), async (ctx, next) => {
    const { state, db, data, query, nkcModules, permission } = ctx;
    const { zoneTypes, zoneTab, type, tab } = data;
    const { page = 0 } = query;
    if (type !== zoneTypes.moment) {
      return await next();
    }
    const { zoneMomentList = 50 } = await db.SettingModel.getSettings('page');
    const momentStatus = await db.MomentModel.getMomentStatus();
    const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
    const { own, everyone, attention } =
      await db.MomentModel.getMomentVisibleType();
    const match = {
      parent: '',
      quoteType: {
        $in: ['', momentQuoteTypes.moment],
      },
      $or: [],
    };

    // 关注用户的uid
    let subUid = [];
    // 我的关注页需要添加用户筛选
    const condition = {};
    if (tab === zoneTab.subscribe) {
      const usersId = [];
      if (state.uid) {
        subUid = await db.SubscribeModel.getUserSubUsersId(state.uid);
        usersId.push(...subUid, state.uid);
      }
      condition.uid = {
        $in: usersId,
      };
    }

    // 获取当前用户的电文
    // 可看自己非正常状态的电文
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
    // 看别人正常的电文
    match.$or.push({
      ...condition,
      status: momentStatus.normal,
      visibleType: everyone,
    });
    // 看关注的人的关注可见的电文
    match.$or.push({
      uid: {
        $in: subUid,
      },
      status: momentStatus.normal,
      visibleType: attention,
    });
    // 如果具有调整可见性的权限
    // 可以看别人非公开的电文
    const hasPermission =
      ctx.permission('setMomentVisibleOther') ||
      ctx.permission('viewOtherUserAbnormalMoment');
    if (hasPermission) {
      match.$or.push({
        ...condition,
        status: {
          $in: [momentStatus.normal],
        },
        visibleType: {
          $in: [own, everyone, attention],
        },
      });
    }
    // 电文管理员可看见所有的电文
    if (ctx.permission('managementMoment')) {
      match.$or.push({
        ...condition,
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

    const paging = nkcModules.apiFunction.paging(page, count, zoneMomentList);
    const moments = await db.MomentModel.find(match)
      .sort({ top: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    // 电文阅读数+1
    const momentIds = moments.map((m) => m._id);
    if (momentIds.length) {
      await db.MomentModel.updateMany(
        { _id: { $in: momentIds } },
        { $inc: { hits: 1 } },
      );
    }
    data.momentsData = await db.MomentModel.extendMomentsListData(
      moments,
      state.uid,
    );
    data.paging = paging;
    data.permissions = permissions;
    await next();
  })
  .get('/', Public(), async (ctx, next) => {
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
  .get(
    ['/editor/rich', '/editor/rich/history'],
    OnlyUser(),
    async (ctx, next) => {
      if (!ctx.state.uid) {
        ctx.throw(403, '权限不足');
      }
      ctx.remoteTemplate = 'zone/zone.pug';
      await next();
    },
  )
  .use('/m', momentRouter.routes(), momentRouter.allowedMethods())
  .use('/a', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;
