const router = require('koa-router')();
router
  .get('/:bid', async (ctx, next) => {
    //获取book
    const {data, params, db, nkcModules} = ctx;
    const {bid} = params;
    const {timeFormat, getUrl} = nkcModules.tools;
    const book = await db.BookModel.getBookByBid(bid);
    data.bookList = await book.getList();
    data.bookData = {
      _id: book._id,
      name: book.name,
      description: book.description,
      uid: book.uid,
      time: timeFormat(book.toc),
      coverUrl: getUrl('bookCover', book.cover)
    };
    await next();
  })
  .post('/:bid/member', async (ctx, next) => {
    const {data, body, params, db} = ctx;
    const {bid} = params;
    const {membersId} = body;
    const book = await db.BookModel.getBookByBid(bid);
    await book.addMembers(membersId);
    data.bookMembers = await book.getAllMembers();
    await next();
  })
  .del('/:bid/member', async (ctx, next) => {
    const {params, query, data, db} = ctx;
    const {bid} = params;
    const {uid} = query;
    const book = await db.BookModel.getBookByBid(bid);
    await book.removeMemberByUid(uid);
    data.bookMembers = await book.getAllMembers();
    await next();
  })
  /*.get('/:bid/:id', async (ctx, next) => {
    //获取 article
    const {data, params, db, state} = ctx;
    const book = await db.BookModel.findOnly({_id: params.bid});
    data.bookArticle = await book.getContentById({aid: params.id, uid: state.uid});
    data.bookList = await book.getList();
    data.bookData = {
      _id: book._id,
      name: book.name,
    };
    await next();
  })*/
module.exports = router;
