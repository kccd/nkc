const router = require('koa-router')();
const articleRouter = require('./article');
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
  .use('/article', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;