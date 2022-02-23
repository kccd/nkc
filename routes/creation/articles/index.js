const router = require('koa-router')();
const columnRouter = require("./column");
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .get('/editor', async (ctx, next) => {
    const {query, data, db, state} = ctx;
    const {bid, aid} = query;
    const book = await db.BookModel.findOnly({_id: bid});
    const bookPermission = await book.getBookPermissionForUser(state.uid);
    if(!bookPermission) return ctx.throw(400, '权限不足');
    if(aid) {
      await book.checkArticleId(aid);
      const article = await db.ArticleModel.findOnly({_id: aid});
      const {
        title,
        cover,
        content,
        did,
        _id
      } = await article.getEditorBetaDocumentContent();
      data.article = {
        articleId: article._id,
        title,
        cover,
        content,
        did,
        _id
      };
    }
    data.book = {
      _id: book._id,
      name: book.name
    };
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
      origin
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
        sid
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
