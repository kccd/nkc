const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, state, data} = ctx;
    data.books = await db.BookModel.getBooksByUserId(state.uid);
    data.otherBooks = await db.BookModel.getOtherBooksByUserId(state.uid);
    await next();
  })
  .get('/editor', async (ctx, next) => {
    //获取图书设置
    const {db, data, query, nkcModules, state} = ctx;
    const {bid} = query;
    const book = await db.BookModel.findOnly({_id: bid});
    const {timeFormat, getUrl} = nkcModules.tools;
    data.bookData = {
      _id: book._id,
      name: book.name,
      description: book.description,
      uid: book.uid,
      time: timeFormat(book.toc),
      coverUrl: getUrl('bookCover', book.cover),
      read: book.read,
    };
    data.bookMembers = await book.getAllMembers();
    const adminPermissions = await db.BookModel.getAdminPermissions();
    const memberPermissions = await db.BookModel.getMemberPermissions();
    data.rolePermission = {
      admin: adminPermissions.map(p => state.lang('bookPermissions', p)),
      member: memberPermissions.map(p => state.lang('bookPermissions', p))
    };
    await next();
  })
  .post('/editor', async (ctx, next) => {
    //提交图书设置
    const {state, body, db, data} = ctx;
    const {files, fields} = body;
    const {cover} = files;
    let {
      name,
      description,
      bookId,
      members,
      read,
    } = JSON.parse(fields.book);
    let book;
    if(bookId) {
      book = await db.BookModel.findOnly({_id: bookId});
    } else {
      read = 'self';
    }
    const bookInfo = {
      name,
      description,
      uid: state.uid,
      read,
    };
    await db.BookModel.checkBookInfo(bookInfo);
    if(!book) {
      book = await db.BookModel.createBook(bookInfo);
    } else {
      //新创作成员
      const newMembersObj = {};
      for(const m of members) {
        if(m.uid === state.uid) continue;
        newMembersObj[m.uid] = m;
      }
      //原创作成员
      const bookMembers = book.members;
      for(const bm of bookMembers) {
        const newBm = newMembersObj[bm._id];
        if(!newBm) continue;
        bm.role = newBm.role;
      }
      await book.updateOne({
        $set: {
          name,
          description,
          members: bookMembers,
          read
        }
      });
    }
    if(cover) {
      await db.AttachmentModel.saveBookCover(book._id, cover);
    }
    data.bookId = book._id;
    await next();
  });
module.exports = router;
