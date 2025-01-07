const router = require('koa-router')();
const { OnlyUser } = require('../../../middlewares/permission');
const articleRouter = require('./article');
const draftRouter = require('./draft');
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
  .use('/draft', draftRouter.routes(), draftRouter.allowedMethods())
  .use('/article', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;
