const router = require('koa-router')();
const columnRouter = require("./column");
const customCheerio = require('../../../nkcModules/nkcRender/customCheerio');
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .get('/editor', async (ctx, next) => {
    //获取独立文章信息
    const {query, state, db, data, permission} = ctx;
    let {aid, mid, source} = query;
    const {user} = data;
    if(!source) ctx.throw(401, '文章来源未知');
    let document;
    let article;
    let articles;
    //获取article来源
    const articleSource = (await db.ArticleModel.getArticleSources())[source];
    const editorInfo = {};
    if(aid) {
      //通过aid获取article
      const _article = await db.ArticleModel.findOnly({_id: aid});
      if(!permission('modifyOtherArticles')) {
        if(user.uid !== _article.uid) ctx.throw(403, '您没有权限修改别人的文章');
      }
      if(_article.status === 'deleted') {
        ctx.throw(403, '没有权限');
      }
      const articleObj = {
        _id: aid,
        source: articleSource
      }
      if(state.uid === _article.uid){
        articleObj.uid = state.uid;
      }
      article = await db.ArticleModel.findOnly(articleObj);
      if(!article) ctx.throw(400, '未找到article,请刷新后重试');
      if(article.status === 'deleted') ctx.throw(403, '权限不足');
      const documentSource = (await db.DocumentModel.getDocumentSources()).article;
      document = await db.DocumentModel.getBetaDocumentContentBySource(documentSource, article._id);
      if(document) {
        editorInfo.document = document;
      }
      data.articleId = article._id;
    } else {
      //如果不存在aid就获取当前专栏或者当前用户空间下的所有文章草稿
      const articleStatus = (await db.ArticleModel.getArticleStatus())['default'];
      const m = {
        sid: mid?mid:'',
        uid: state.uid,
        status: articleStatus,
        source: articleSource,
        hasDraft: true
      };
      articles = await db.ArticleModel.find(m).sort({toc: -1}).limit(3);
      const options = [
        'title',
      ];
      articles = await db.ArticleModel.extendDocumentsOfArticles(articles, 'beta', options);
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
    //创建，修改，编辑文章
    const {db, data, state, body, nkcModules} = ctx;
    const {files, fields} = body;
    const {coverFile} = files;
    const {type, articleId, source, sid} = fields;
    const {normal: normalStatus, default: defaultStatus} = await db.ArticleModel.getArticleStatus();
    const {column: columnSource, zone: zoneSource} = await db.ArticleModel.getArticleSources();
    if(!['modify', 'create', 'publish', 'save', 'autoSave'].includes(type)) ctx.throw(400, `未知的提交类型 ${type}`);
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
    //内容校验
    if(title && title.length > 100) ctx.throw(400, `标题不能超过100个字`);
    const _content = customCheerio.load(content).text();
    if(_content && _content.length > 100000) ctx.throw(400, `内容不能超过10万字`);
    nkcModules.checkData.checkString(content, {
      name: "内容",
      minLength: 0,
      maxLength: 2000000
    });
    let article;
    if(articleId) {
      article = await db.ArticleModel.findOnly({_id: articleId});
    }
    if(type === 'create' && !article) {
      article = await db.ArticleModel.createArticle({
        ip: ctx.address,
        port: ctx.port,
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
    } else if(article){
      if(!articleId) ctx.throw(401, '未接收文章ID');
      //编辑或发布
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
        if(source === columnSource && article.status === defaultStatus && (!selectCategory.selectedMainCategoriesId || selectCategory.selectedMainCategoriesId.length === 0)) ctx.throw(401, '未选择文章专栏分类');
        //检测文章专栏分类是否有效
        if(source === columnSource && article.status === defaultStatus) {
          await db.ColumnPostCategoryModel.checkColumnCategory(selectCategory);
        }
        data.articleUrl = await article.publishArticle({source, selectCategory});
      } else if(type === 'save') {
        await article.saveArticle();
      } else if(type === 'autoSave') {
        await article.autoSaveArticle();
      }
      //改变article的hasDraft状态
      await article.changeHasDraftStatus();
    }
    if(type === 'publish') {
      data.articleCover = await article.getStableDocumentCoverId();
    } else {
      data.articleCover = await article.getBetaDocumentCoverId();
    }
    if(article) {
      // 写文章后返回信息
      data.document = await db.DocumentModel.findOne({
        sid: article._id
      });
      data.articleId = article._id;
    }
    await next();
  })
  .use('/column', columnRouter.routes(), columnRouter.allowedMethods())
module.exports = router;
