const router = require('koa-router')();
const zoneTypes = {
  moment: 'moment',
  article: 'article'
};
router
  .use('/', async (ctx, next) => {
    const {query, data, db} = ctx;
    let {t} = query;
    if(t !== zoneTypes.article) {
      t = zoneTypes.moment;
    }
    data.zoneTypes = zoneTypes;
    data.t = t;
    await next();
  })
  // 动态
  .get('/', async (ctx, next) => {
    const {state, db, data, query, nkcModules, permission} = ctx;
    const {t, zoneTypes} = data;
    if(t !== zoneTypes.moment) {
      return await next();
    }
    const {page = 0} = query;
    const {
      normal: normalStatus,
      faulty: faultyStatus,
      unknown: unknownStatus,
    } = await db.MomentModel.getMomentStatus();
    const match = {
      parent: '',
      $or: [
        {
          status: normalStatus
        }
      ]
    };
    if(state.uid) {
      // 加载自己非正常状态的动态
      match.$or.push({
        uid: state.uid,
        status: {
          $in: [
            normalStatus,
            faultyStatus,
            unknownStatus,
          ]
        }
      });
    }
    //获取当前用户对动态的审核权限
    const permissions = {
      reviewed: null,
    };
    if(state.uid) {
      if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.reviewed = true;
      }
    }
    const count = await db.MomentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const moments = await db.MomentModel
      .find(match)
      .sort({top: -1})
      .skip(paging.start)
      .limit(paging.perpage)
    data.momentsData = await db.MomentModel.extendMomentsListData(moments, state.uid);
    data.paging = paging;
    data.permissions = permissions;
    ctx.remoteTemplate = 'latest/zone/moment.pug';
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {t, zoneTypes} = data;
    if(t !== zoneTypes.article) {
      return await next();
    }
    const {page = 0} = query;
    const articleStatus = await db.ArticleModel.getArticleStatus();
    const match = {
      status: articleStatus.normal,
    };
    const count = await db.ArticleModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const articles = await db.ArticleModel.find(match)
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    const pageSettings = await db.SettingModel.getSettings('page');
    data.latestZoneArticlePanelStyle = pageSettings.articlePanelStyle.latestZone;
    data.articlesPanelData = await db.ArticleModel.extendArticlesPanelData(articles);
    data.paging = paging;
    ctx.remoteTemplate = 'latest/zone/article.pug';
    await next();
  })
module.exports = router;
