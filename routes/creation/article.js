const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    //获取独立文章信息
    const {query, state, db, data} = ctx;
    const {aid, mid} = query;
    let document;
    let article;
    let articles;
    const editorInfo = {};
    if(aid) {
        //通过aid获取article
        article = await db.ArticleModel.findOnly({_id: aid, uid: state.uid});
        if(!article) ctx.throw(400, '未找到article,请刷新后重试');
        if(article.status === 'deleted') ctx.throw(403, '权限不足');
        const documentSource = (await db.DocumentModel.getDocumentSources()).article;
        document = await db.DocumentModel.getBetaDocumentContentBySource(documentSource, article._id);
        if(document) {
            editorInfo.document = document;
        }
        data.articleId = article._id;
    } else {
        //通过columnId获取article
        const articleStatus = (await db.ArticleModel.getArticleStatus())['default'];
        articles = await db.ArticleModel.find({sid: mid, uid: state.uid, status: articleStatus, hasDraft: true}).sort({toc: -1}).limit(3);
        const options = [
            'title',
        ];
        articles = await db.ArticleModel.extendDocumentsOfArticles(articles, options);
    }

    if(article) {
        editorInfo.article = article;
    }
    if(articles) {
        editorInfo.articles = articles;
    }
    data.editorInfo = editorInfo;
    await next();
  })

module.exports = router;
