const router = require('koa-router')();
const articleRouter = require('./article');
const momentRouter = require('./moment');
const draftRouter = require('./draft');
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .get('/article', async (ctx, next) => {
    await next();
  })
  .get('/draft', async (ctx, next) => {
    await next();
  })
  .get('/article/editor', async (ctx, next) => {
    await next();
  })
  .use('/article', articleRouter.routes(), articleRouter.allowedMethods())
  .use('/draft', draftRouter.routes(), draftRouter.allowedMethods())
  .use('/moment', momentRouter.routes(), momentRouter.allowedMethods());
module.exports = router;
