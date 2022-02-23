const router = require('koa-router')();
router
  .del('/', async (ctx, next) => {
    const {db, params, state} = ctx;
    const {aid} = params;
    const article = await db.ArticleModel.getArticleByIdAndUid(aid, state.uid);
    await article.deleteDraft();
    await next();
  });
module.exports = router;