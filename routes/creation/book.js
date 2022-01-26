const router = require('koa-router')();
const listRouter = require('./list')
router
  .get('/:bid', async (ctx, next) => {
    const {data, params, db, nkcModules,} = ctx;
    const {bid} = params;
    const {timeFormat, getUrl} = nkcModules.tools;
    const book = await db.BookModel.findOnly({_id: bid});
    let bookList = book.list.toObject();
    // setUrl:undefined 使用内部默认 latestTitle =true 代表需要最新编辑的 title
    data.bookList = await book.getList({setUrl:'bookContent', latestTitle:true}, bookList) || [];
    book.bindArticle
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
    let bookList =book.list.toObject();
    data.bookArticle = await book.getContentById({aid: params.id, uid: state.uid});
    data.bookList = await book.getList(undefined,bookList);
    data.bookData = {
      _id: book._id,
      name: book.name,
    };
    await next();
  })
  .use('/:bid', listRouter.routes(), listRouter.allowedMethods())
module.exports = router;
