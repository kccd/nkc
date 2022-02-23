const router = require('koa-router')();
const draftRouter = require('./draft');
router
  // 删除 article
  .del('/:aid', async (ctx, next) => {
    const {params, db, state} = ctx;
    const {aid} = params;
    const article = await db.ArticleModel.getArticleByIdAndUid(aid, state.uid);
    await article.deleteArticle();
    await next();
  })
  .use('/:aid/draft', draftRouter.routes(), draftRouter.allowedMethods())
module.exports = router;
