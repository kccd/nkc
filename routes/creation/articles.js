const router = require('koa-router')();
router
  .get('/editor', async (ctx, next) => {
    const {query, data, db} = ctx;
    const {bid, aid} = query;
    const book = await db.BookModel.findOnly({_id: bid});
    if(aid) {
      if(!book.list.includes(aid)) {
        ctx.throw(400, `文章 ID 错误`);
      }
      const article = await db.ArticleModel.findOnly({_id: aid});
      const {
        title,
        cover,
        content,
        did,
        _id
      } = await article.getBetaDocumentContent();
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
    const {body, state, data, db} = ctx;
    const {files, fields} = body;
    const {coverFile} = files;
    const type = fields.type;
    const bookId = fields.bookId;
    const articleId = fields.articleId;
    if(!['modify', 'publish', 'create', 'save'].includes(type)) ctx.throw(400, `未知的提交类型 type: ${type}`);
    const {title, content, cover} = JSON.parse(fields.article);
    let article;
    if(type === 'create') {
      article = await db.ArticleModel.createArticle({
        uid: state.uid,
        title,
        content,
        coverFile,
      });
      const book = await db.BookModel.findOnly({_id: bookId});
      await book.bindArticle(article._id);
    } else {
      article = await db.ArticleModel.findOnly({_id: articleId});
      await article.modifyArticle({
        title,
        content,
        cover,
        coverFile
      });
      if(type === 'publish') {
        await article.publishArticle();
      } else if(type === 'save') {
        await article.saveArticle();
      }
    }
    data.articleCover = await article.getBetaDocumentCoverId();
    // 写文章后返回信息
    data.doucment = await db.DocumentModel.findOne({sid:article._id});
    data.articleId = article._id;
    await next();
  });
module.exports = router;
