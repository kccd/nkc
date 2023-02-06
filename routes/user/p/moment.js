module.exports = async (ctx, next) => {
  const {data, db, nkcModules, query, state, permission} = ctx;
  const {page = 0, t = 'moment'} = query;
  const {targetUser, user} = data;
  data.t = t;
  let paging;
  if(t === 'moment') {
    const {
      normal: normalMoment,
      faulty: faultyMoment,
      unknown: unknownMoment,
      disabled: disabledMoment,
    } = await db.MomentModel.getMomentStatus();
    const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
    //获取用户动态列表
    const match = {
      uid: targetUser.uid,
      parent: '',
      quoteType: {
        $in: [
          momentQuoteTypes.moment,
          momentQuoteTypes.article,
          ''
        ]
      },
      $or: [
        {
          status: normalMoment
        },
        {
          uid: state.uid,
          status: {
            $in: [
              normalMoment,
              faultyMoment,
              unknownMoment,
              disabledMoment,
            ]
          }
        }
      ]
    };
    const count = await db.MomentModel.countDocuments(match);
    paging = nkcModules.apiFunction.paging(page, count, 20);
    const moments = await db.MomentModel.find(match).sort({top: -1}).skip(paging.start).limit(paging.perpage);
    data.momentsData = await db.MomentModel.extendMomentsListData(moments, state.uid);
  } else if(t === 'thread') {
    const {normal: normalArticle} = await db.ArticleModel.getArticleStatus();
    const {zone: zoneSource} = await db.ArticleModel.getArticleSources();
    //查找空间文章
    const match = {
      source: zoneSource,
      uid: targetUser.uid,
      status: normalArticle,
    };
    const count = await db.ArticleModel.countDocuments(match);
    // paging = nkcModules.apiFunction.paging(page, count, 20);
    // let zoneArticles = await db.ArticleModel.find(match).sort({toc: -1});
    paging = nkcModules.apiFunction.paging(page, count, 20);
    let zoneArticles = await db.ArticleModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    zoneArticles = await db.ArticleModel.getArticlesInfo(zoneArticles);
    data.momentsData = [];
    for(const article of zoneArticles) {
      data.momentsData.push({
        type: 'article',
        content: nkcModules.nkcRender.htmlToPlain(article.document.content, 200),
        title: article.document.title,
        cover: article.document.cover,
        toc: article.toc,
        voteUp: article.voteUp,
        voteDown: article.voteDown,
        hits: article.hits,
        count: article.count,
        url: article.url,
      });
    }
  }
  //获取当前用户对动态的审核权限
  const permissions = {
    reviewed: null,
  };
  if(user) {
    if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
      permissions.reviewed = true;
    }
  }

  data.paging = paging;
  data.permissions = permissions;
  await next();
}
