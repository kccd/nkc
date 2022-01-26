const router = require('koa-router')();
router
  .get('/:bid', async (ctx, next) => {
    const {query, params, data, db, nkcModules, state} = ctx;
    const {bid} = params;
    const {aid} = query;
    const book = await db.BookModel.findOnly({_id: bid});
    const bookList = book.list.toObject()
    data.book = await book.getBaseInfo();
    data.list = await book.getList(undefined, bookList, 'published'); //'published'
    if(aid) {
      data.bookContent = await book.getContentById({
        aid,
        uid: state.uid
      });
      data.bookContentEditor = nkcModules.tools.getUrl('editBookArticle', book._id, data.bookContent.aid);
      ctx.remoteTemplate = `book/bookContent.pug`;
    } else {
      ctx.remoteTemplate = `book/book.pug`;
    }
    await next();
  })
 
module.exports = router;