const router = require("koa-router")();

router
  .get("/editor", async (ctx, next) => {
    const { query, data, db } = ctx;
    const { bid, aid } = query;
    const book = await db.BookModel.findOnly({
      _id: bid
    });
    if (aid) {
      let aidStatus=false
      function find(data,id){
        if(data){
        for (const obj of data) {
          if(obj.id === id){
            aidStatus= true
            return
          }else if(obj.child && obj.child.length){
            find(obj.child,id)
          }
        }
        }
      }
      find(book.list,aid)
      if (!aidStatus) {
        ctx.throw(400, `文章 ID 错误`);
      }
      const article = await db.ArticleModel.findOnly({
        _id: aid
      });
      const {
        title,
        cover,
        content,
        did,
        _id
      } = await article.getBetaDocumentContent();
      data.article = {
        articleId: article._id,
        title,
        cover,
        content,
        did,
        _id
      };
    }
    data.book = {
      _id: book._id,
      name: book.name
    };

    await next();
  })
  .post("/editor", async (ctx, next) => {
    const { body, state, data, db } = ctx;
    const { files, fields } = body;
    const { coverFile } = files;
    const type = fields.type;
    const bookId = fields.bookId;
    const articleId = fields.articleId;
    if (!["modify", "publish", "create", "save"].includes(type))
      ctx.throw(400, `未知的提交类型 type: ${type}`);
    const { title, content, cover } = JSON.parse(fields.article);
    let article;
    const book = await db.BookModel.findOne({
      _id: bookId
    });
    let bookList = book.list.toObject();
    if (type === "create") {
      // 先创建 一个默认数据，如果是 文章类型，再加上aid  
      let child={
        id:'',
        title,
        type: 'article',
        child: []
      }
      function changeChild(bookList) {
        // 给最外层添加  
        if (fields.level === "outermost" || bookList.length < 1) {
          bookList.push(child);
          return;
        }
        bookList.forEach(item => {
          if (item.aid === fields.aid) {
            item.child.unshift({
              id:'',
              title,
              type: 'article',
              child: []
            });
          } else if (item.child && item.child.length) {
            changeChild(item.child);
          }
        });
      }
      changeChild(bookList);
      // if (fields.articleType === "article") {
        article = await db.ArticleModel.createArticle({
          uid: state.uid,
          title,
          content,
          coverFile
        });
        child.id=article._id
        const res = await db.BookModel.updateOne(
          { _id: bookId },
          { $set: { list: bookList }}
        );
      // } else {
      //   const res = await db.BookModel.updateOne(
      //     { _id: bookId },
      //     { $set: { list: bookList }}
      //   );
      //   return;
      // }
    } else {
      // if (fields.articleType === "article") {
        function find(data,item){
          if(data){
            for (const obj of data) {
              if(obj.id === item.articleId){
                obj.title = title
                return
              }else if(obj.child && obj.child.length){
                find(obj.child,item)
              }
            }
          }
        }
        find(bookList,fields)
        const res = await db.BookModel.updateOne(
          { _id: bookId },
          { $set: { list: bookList }}
        );
      // }
      article = await db.ArticleModel.findOnly({
        _id: articleId
      });
      await article.modifyArticle({
        title,
        content,
        cover,
        coverFile
      });
      if (type === "publish") {
        await article.publishArticle();
      } else if (type === "save") {
        await article.saveArticle();
      }
    }
    data.articleCover = await article.getBetaDocumentCoverId();
    // 写文章后返回信息
    data.document = await db.DocumentModel.findOne({
      sid: article._id
    });
    data.articleId = article._id;
    await next();
  })

module.exports = router;
