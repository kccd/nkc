const router = require('koa-router')();
router
  .get('/:bid', async (ctx, next) => {
    //获取图书列表
    const {data, params, db, nkcModules, state} = ctx;
    const {bid} = params;
    const {timeFormat, getUrl} = nkcModules.tools;
    const book = await db.BookModel.getBookByBid(bid);
    const bookPermission = await book.getBookPermissionForUser(state.uid);
    if(!bookPermission) throwErr(400, '权限不足');
    data.bookList = await book.getList({bookPermission});
    data.bookData = {
      _id: book._id,
      name: book.name,
      description: book.description,
      uid: book.uid,
      time: timeFormat(book.toc),
      coverUrl: getUrl('bookCover', book.cover)
    };
    data.bookMembers = await book.getMembers();
    await next();
  })
  .post('/:bid/member', async (ctx, next) => {
    //添加创作成员
    const {data, body, params, db} = ctx;
    const {bid} = params;
    const {membersId} = body;
    const book = await db.BookModel.getBookByBid(bid);
    await book.addMembers(membersId);
    data.bookMembers = await book.getAllMembers();
    await next();
  })
  .del('/:bid/member', async (ctx, next) => {
    //删除创作成员
    const {params, query, data, db} = ctx;
    const {bid} = params;
    const {uid} = query;
    const book = await db.BookModel.getBookByBid(bid);
    await book.removeMemberByUid(uid);
    data.bookMembers = await book.getAllMembers();
    await next();
  })
  // /*.get('/:bid/:id', async (ctx, next) => {
  //   //获取 article
  //   const {data, params, db, state} = ctx;
  //   const book = await db.BookModel.findOnly({_id: params.bid});
  //   data.bookArticle = await book.getContentById({aid: params.id, uid: state.uid});
  //   data.bookList = await book.getList();
  //   data.bookData = {
  //     _id: book._id,
  //     name: book.name,
  //   };
  //   await next();
  // })*/
module.exports = router;
