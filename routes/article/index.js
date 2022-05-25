const router = require('koa-router')();
const draftRouter = require('./draft');
const optionsRouter = require('./options');
const unblockRouter = require('./unblock');
const collectionRouter = require('./collection');
const digestRouter = require('./digest');
const homeTopRouter = require('./homeTop');
router
  .del('/:aid', async (ctx, next) => {
    const {params, db, state, permission} = ctx;
    const {aid} = params;
    const {uid} = state;//登录用户uid
    const article = await db.ArticleModel.getArticleByIdAndUid(aid, state.uid);
    if(uid === article.uid || permission('deleteArticle')) {
        //删除已经发布的文章的同时删除该文章的所有草稿
        await article.deleteArticle();
    }
    await next();
  })
  .use('/:aid/draft', draftRouter.routes(), draftRouter.allowedMethods())
  .use('/:aid/options', optionsRouter.routes(), optionsRouter.allowedMethods())
  .use('/:aid/unblock', unblockRouter.routes(), unblockRouter.allowedMethods())
  .use('/:aid/collection', collectionRouter.routes(), collectionRouter.allowedMethods())
  .use('/:aid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:aid/homeTop', homeTopRouter.routes(), homeTopRouter.allowedMethods())
module.exports = router;

