const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    //获取独立文章信息
    const {query, state, db, data} = ctx;
    const {aid, mid} = query;
    const article = await db.ArticleModle.findOnly({_id: aid});
    if(!article) ctx.throw(400, '未找到article,请刷新后重试');
    if(article.status === 'deleted') ctx.throw(403, '权限不足');
    const document = await article.getDocumentForArticle();
    data.editorInfo = {
      document,
      article
    };
    data.articleId = aid;
    // const match = {
    //   uid: state.uid,
    //   source: 'column',
    //   published: true,
    //   deleted: false,
    // };
    await next();
})

module.exports = router;