const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {query, db, state, nkcModules, data} = ctx;
    const {page = 0} = query;
    const {uid} = state;
    const {zone: zoneSource} = await db.ArticleModel.getArticleSources();
    const match = {
      uid,
      source: zoneSource,
      hasDraft: true,
    };
    const count = await db.ArticleModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const articles =await db.ArticleModel.find(match)
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    data.articlesDraftList = await db.ArticleModel.extendArticlesDraftList(articles);
    data.paging = paging;
    await next()
  });
module.exports = router;
