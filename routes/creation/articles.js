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
      const {did, betaDid} = article;
      const documentId = betaDid || did;
      const {
        title,
        cover,
        content,
      } = await db.DocumentModel.findOnly({_id: documentId});
      data.article = {
        articleId: article._id,
        title,
        cover,
        content
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
    console.log(body)
    if(!['modify', 'publish', 'create'].includes(type)) ctx.throw(400, `未知的提交类型 type: ${type}`);
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
      }
    }
    data.articleId = article._id;
    await next();
  });
module.exports = router;