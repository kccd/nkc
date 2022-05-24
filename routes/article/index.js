const router = require('koa-router')();
const draftRouter = require('./draft');
const optionsRouter = require('./options');
const unblockRouter = require('./unblock');
const collectionRouter = require('./collection');
const digestRouter = require('./digest');
router
  .del('/:aid', async (ctx, next) => {
    const {params, db, state} = ctx;
    const {aid} = params;
    const article = await db.ArticleModel.getArticleByIdAndUid(aid, state.uid);
    //删除已经发布的文章的同时删除该文章的所有草稿
    await article.deleteArticle();
    await next();
  })
  .use('/:aid/draft', draftRouter.routes(), draftRouter.allowedMethods())
  .use('/:aid/options', optionsRouter.routes(), optionsRouter.allowedMethods())
  .use('/:aid/unblock', unblockRouter.routes(), unblockRouter.allowedMethods())
  .use('/:aid/collection', collectionRouter.routes(), collectionRouter.allowedMethods())
  .use('/:aid/digest', digestRouter.routes(), digestRouter.allowedMethods())
module.exports = router;

