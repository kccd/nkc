const router = require('koa-router')();
router
  .get('/:bid', async (ctx, next) => {
    const {data, params, db, nkcModules} = ctx;
    const {bid} = params;
    const {timeFormat, getUrl} = nkcModules.tools;
    const book = await db.BookModel.findOnly({_id: bid}); 
    let bookList =JSON.parse(JSON.stringify(book.list));
    // const document = await db.DocumentModel.findOnly({sid: bid});
        // setUrl:undefined 使用内部默认 latestTitle =true 代表需要最新编辑的 title 
    data.bookList = await book.getList({setUrl:'bookContent',latestTitle:true},bookList,bid) || [];
    book.bindArticle
    // data.bookList.document=document
    data.bookData = {
      bid: book._id,
      name: book.name,
      description: book.description,
      uid: book.uid,
      time: timeFormat(book.toc),
      coverUrl: getUrl('bookCover', book.cover)
    };
    await next();
  })
  .get('/:bid/:id', async (ctx, next) => {
    const {data, params, db, state} = ctx;
    const book = await db.BookModel.findOnly({_id: params.bid});
    data.bookArticle = await book.getContentById({aid: params.id, uid: state.uid});
    data.bookList = await book.getList();
    data.bookData = {
      _id: book._id,
      name: book.name,
    };
    await next();
  });
module.exports = router;
