const Router = require('koa-router');
const { OnlyUser, Public } = require('../../../../middlewares/permission');
const {
  momentCheckerService,
} = require('../../../../services/moment/momentChecker.service');
const editorRouter = require('./editor');
const momentRouter = require('./moment');
const router = new Router();
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
    ctx.apiData = {
      momentsData: data.momentsData,
      permissions: data.permissions,
      subUid: data.subUid,
      tab: data.tab,
      zoneTab: data.zoneTab,
      type: data.type,
      paging: data.paging,
      zoneTypes: data.zoneTypes,
    };
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
    ctx.apiData = {
      permissions: data.permissions,
      subUid: data.subUid,
      tab: data.tab,
      zoneTab: data.zoneTab,
      type: data.type,
      paging: data.paging,
      zoneTypes: data.zoneTypes,
      articlesPanelData: data.articlesPanelData,
      latestZoneArticlePanelStyle: data.latestZoneArticlePanelStyle,
    };
    await next();
  })
  .get('/m/:mid', Public(), async (ctx, next) => {
    const { permission, data, state, db, params } = ctx;
    const { mid } = params;
    const moment = await db.MomentModel.findOne({ _id: mid });
    if (!moment) {
      ctx.throw(404, `动态 ID 错误 momentId=${mid}`);
    }
    await momentCheckerService.checkMomentPermission(
      state.uid,
      moment,
      permission('review'),
    );
    let targetMoment;
    let focusCommentId;
    if (moment.parents.length > 0) {
      targetMoment = await db.MomentModel.findOnly({ _id: moment.parents[0] });
      focusCommentId = moment._id;
    } else {
      targetMoment = moment;
      focusCommentId = '';
    }
    const [momentListData] = await db.MomentModel.extendMomentsListData(
      [targetMoment],
      state.uid,
    );
    if (!momentListData) {
      ctx.throw(500, `动态数据错误 momentId=${moment._id}`);
    }
    data.permissions = {
      reviewed:
        state.uid &&
        (permission('movePostsToRecycle') || permission('movePostsToDraft')),
    };
    data.focusCommentId = focusCommentId;
    if (state.uid) {
      const subscribeUsersId = await db.SubscribeModel.getUserSubUsersId(
        state.uid,
      );
      momentListData.subscribed = subscribeUsersId.includes(targetMoment.uid);
    }
    data.momentListData = momentListData;
    ctx.apiData = {
      momentListData: data.momentListData,
      focusCommentId: data.focusCommentId,
      permissions: data.permissions,
    };
    await moment.addMomentHits();
    await next();
  })
  .use(
    '/moment/:momentId',
    momentRouter.routes(),
    momentRouter.allowedMethods(),
  )
  .use('/editor', editorRouter.routes(), editorRouter.allowedMethods());
module.exports = router;
