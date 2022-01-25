const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    ctx.template='creation/preview/document.pug'
    ctx.remoteTemplate=''
    const {db, data,query,state} = ctx;
    // _id 是文章唯一的 id   侧边栏未显示最新数据
    let {did,bid,aid,_id}=query
    const book = await db.BookModel.findOnly({_id: bid});
    data.book = await book.getBaseInfo();
    let bookList =book.list.toObject();
    data.list = await book.getList({setUrl:'prevView',latestTitle:true},bookList) || [];
    if(aid){
      data.bookContent = await book.getContentById({
        aid,
        uid: state.uid
      });
        // data.bookContentEditor = nkcModules.tools.getUrl('editBookArticle', book._id, data.bookContent.aid);
    }
    // 新建文章再预览时 是没有拿did的 因此
    if(!did) did=aid
    const document = await db.DocumentModel.find({sid:aid}).sort({tlm:-1});
      data.document = document[0].toObject()
      await next();
  })
module.exports=router
