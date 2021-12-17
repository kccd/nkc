const router = require('koa-router')();
router
  .get('/editor', async (ctx, next) => {
    await next();
  })
  .post('/editor', async (ctx, next) => {
    const {body, state, data} = ctx;
    const {files, fields} = body;
    const {cover} = files;
    const type = fields.type;
    const bookId = fields.bookId;
    if(!['modify', 'publish', 'create'].includes(type)) ctx.throw(400, `未知的提交类型 type: ${type}`);
    const {articleId, title, content} = JSON.parse(fields.article);
    let article;
    if(type === 'create') {
      article = await db.ArticleModel.createArticle({
        uid: state.uid,
        title,
        content,
        cover,
      });
      const book = await db.BookModel.findOnly({_id: bookId});
      await book.bindArticle(article._id);
    } else if(type === 'modify') {
      article = await db.ArticleModel.findOnly({_id: articleId});
      await article.modifyArticle({
        title,
        content,
        cover
      });
    } else {
      article = await db.ArticleModel.findOnly({_id: articleId});
      await article.modifyArticle({
        title,
        content,
        cover,
      });
      await article.publishArticle();
    }
    data.articleId = article._id;
    await next();
  });
module.exports = router;