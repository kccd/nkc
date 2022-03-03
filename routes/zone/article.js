const router = require('koa-router')();
router
  .get('/:aid', async (ctx, next) => {
    ctx.template = 'zone/article.pug'
    const { db, data, params } = ctx;
    const { aid } = params;
    // 获取文章需要显示的数据
    const articleRelatedContent = await db.ArticleModel.getZoneArticle(aid);

    data.columnPost = articleRelatedContent
    await next();
  });
module.exports = router;