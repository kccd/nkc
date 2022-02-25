const router = require('koa-router')();
const columnRouter = require("./column");
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .get('/editor', async (ctx, next) => {
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
  .post('/editor', async (ctx, next) => {
    const {db, data, state, body} = ctx;
    const {files, fields} = body;
    const {coverFile} = files;
    const {type, articleId, source, sid} = fields;
    if(!['modify', 'create', 'publish', 'save'].includes(type)) ctx.throw(400, `未知的提交类型 ${type}`);
    const {
      title,
      content,
      cover,
      keywords,
      keywordsEN,
      abstract,
      abstractEN,
      origin,
      selectCategory,
      authorInfos,
    } = JSON.parse(fields.article);
    let article;
    if(type === 'create') {
      article = await db.ArticleModel.createArticle({
        uid: state.uid,
        title,
        content,
        coverFile,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin,
        source,
        sid,
        authorInfos
      });
    } else {
      if(!articleId) ctx.throw(401, '未接收文章ID');
      //编辑或发布
      article = await db.ArticleModel.findOnly({_id: articleId});
      if(!article) ctx.throw(400, '未找到文章');
      await article.modifyArticle({
        title,
        content,
        coverFile,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin,
        authorInfos
      });
      if(type === 'publish') {
        //判断用户是否选择文章专栏分类
        if(source === 'column' && selectCategory.selectedMainCategoriesId.length === 0) ctx.throw(401, '未选择文章专栏分类');
        //检测文章专栏分类是否有效
        if(selectCategory.selectedMainCategoriesId.length !== 0 || selectCategory.selectedMinorCategoriesId.length !== 0) {
          await db.ColumnPostCategoryModel.checkColumnCategory(selectCategory);
        }
        await article.publishArticle({source, selectCategory});
      } else if(type === 'save') {
        await article.saveArticle();
      }
      //改变article的hasDraft状态
      await article.changeHasDraftStatus();
    }
    data.articleCover = await article.getBetaDocumentCoverId();
    // 写文章后返回信息
    data.document = await db.DocumentModel.findOne({
      sid: article._id
    });
    data.articleId = article._id;
    await next();
  })
  .use('/column', columnRouter.routes(), columnRouter.allowedMethods())
module.exports = router;
