const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {query, db, state, nkcModules, data} = ctx;
    const {page = 0} = query;
    const {uid} = state;
    const {column: columnSource} = await db.ArticleModel.getArticleSources();
    const match = {
      uid,
      source: columnSource,
      hasDraft: true,
    };
    const count = await db.ArticleModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const articles =await db.ArticleModel.find(match)
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    data.articlesDraftList = await db.ArticleModel.extendArticlesDraftList(articles);
    /*for (const item of columnArticles) {
      articlesId.push(item._id);
    }
    const articleBetaDocumentsObject = await db.ArticleModel.getBetaDocumentsObjectByArticlesId(articlesId);
    for(const article of columnArticles) {
      const betaDocument = articleBetaDocumentsObject[article._id];
      if(!betaDocument) continue;
      const {title, content, toc} = betaDocument;
      data.draftsData.push({
        title,
        content: nkcModules.nkcRender.htmlToPlain(content, 200),
        time: nkcModules.tools.timeFormat(toc),
        articleId: article._id,
        columnId: article.sid
      });
    }*/
    await next()
  });
module.exports = router;