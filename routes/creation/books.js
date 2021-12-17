const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, state, data} = ctx;
    data.books = await db.BookModel.getBooksByUserId(state.uid);
    await next();
  })
  .get('/editor', async (ctx, next) => {
    await next();
  })
  .post('/editor', async (ctx, next) => {
    const {state, body, db} = ctx;
    const {files, fields} = body;
    const {cover} = files;
    const {name, description, bookId} = JSON.parse(fields.book);
    let book;
    if(bookId) {
      book = await db.BookModel.findOnly({_id: bookId});
    }
    const bookInfo = {
      name,
      description,
      uid: state.uid
    };
    await db.BookModel.checkBookInfo(bookInfo);
    if(!book) {
      book = await db.BookModel.createBook(bookInfo);
    } else {
      await book.updateOne({
        $set: {
          name,
          description
        }
      });
    }
    if(cover) {
      await db.AttachmentModel.saveBookCover(book._id, cover);
    }
    await next();
  });
module.exports = router;