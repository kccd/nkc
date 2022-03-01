const router = require('koa-router')();
const draftRouter = require('./draft');
router
  // 删除 article
  .del('/:aid', async (ctx, next) => {
    const {params, db, state} = ctx;
    const {aid} = params;
    const article = await db.ArticleModel.getArticleByIdAndUid(aid, state.uid);
    //删除已经发布的文章的同时删除该文章的所有草稿
    await article.deleteArticle();
    await next();
  })
  .use('/:aid/draft', draftRouter.routes(), draftRouter.allowedMethods())
module.exports = router;
