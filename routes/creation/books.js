const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, state, data} = ctx;
    data.books = await db.BookModel.getBooksByUserId(state.uid);
    await next();
  })
  .get('/creator', async (ctx, next) => {
    await next();
  })
  .post('/creator', async (ctx, next) => {
    const {state, body, db} = ctx;
    const {files, fields} = body;
    const {cover} = files;
    const {name, description} = JSON.parse(fields.book);
    const bookInfo = {
      name,
      description,
      uid: state.uid
    };
    await db.BookModel.checkBookInfo(bookInfo);
    const book = await db.BookModel.createBook(bookInfo);
    if(cover) {
      await db.AttachmentModel.saveBookCover(book._id, cover);
    }
    await next();
  });
module.exports = router;