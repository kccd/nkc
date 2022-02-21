const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {
      query,
      state,
      db,
      nkcModules,
      data
    } = ctx;
    const {page = 0} = query;
    const {column: columnSource} = await db.ArticleModel.getArticleSources();
    const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
    const match = {
      uid: state.uid,
      source: columnSource,
      status: normalStatus
    };
    const count = await db.ArticleModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count, 1);
    const articles = await db.ArticleModel.find(match)
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    data.paging = paging;
    data.articlesList = await db.ArticleModel.extendArticlesList(articles);
    await next();
  })
  .get('/', async (ctx, next) => {
    //获取独立文章信息
    const {query, state, db, data} = ctx;
    const {aid, mid} = query;
    const article = await db.ArticleModle.findOnly({_id: aid});
    if(!article) ctx.throw(400, '未找到article,请刷新后重试');
    if(article.status === 'deleted') ctx.throw(403, '权限不足');
    const document = await article.getDocumentForArticle();
    data.editorInfo = {
      document,
      article
    };
    data.articleId = aid;
    // const match = {
    //   uid: state.uid,
    //   source: 'column',
    //   published: true,
    //   deleted: false,
    // };
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, data, state, body} = ctx;
    const {files, fields} = body;
    const {coverFile} = files;
    const {type, articleId} = fields;
    if(!['modify', 'create', 'publish', 'save'].includes(type)) ctx.throw(400, `未知的提交类型 ${type}`);
    const {
      title,
      content,
      cover,
      keywords,
      keywordsEN,
      abstract,
      abstractEN,
      origin
    } = JSON.parse(fields.article);
    let article;
    if(type === 'create') {
      article = await db.ArticleModel.createArticle({
        uid: state.uid,
        title,
        content,
        coverFile,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin
      });
    } else {
      //编辑或发布
      article = await db.ArticleModel.findOnly({_id: articleId});
      await article.modifyArticle({
        title,
        content,
        coverFile,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin
      });
      if(type === 'publish') {
        await article.publishArticle();
      } else if(type === 'save') {
        await article.saveArticle();
      }
    }
    data.articleCover = await article.getBetaDocumentCoverId();
    // 写文章后返回信息
    data.document = await db.DocumentModel.findOne({
      sid: article._id
    });
    data.articleId = article._id;
    await next();
  })
module.exports = router;
