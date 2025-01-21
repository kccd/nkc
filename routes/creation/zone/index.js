const router = require('koa-router')();
const articleRouter = require('./article');
const momentRouter = require('./moment');
const draftRouter = require('./draft');
const { OnlyUser } = require('../../../middlewares/permission');
router
  .get('/', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/article', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/draft', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .get('/article/editor', OnlyUser(), async (ctx, next) => {
    await next();
  })
  .use('/article', articleRouter.routes(), articleRouter.allowedMethods())
  .use('/draft', draftRouter.routes(), draftRouter.allowedMethods())
  .use('/moment', momentRouter.routes(), momentRouter.allowedMethods());
module.exports = router;
