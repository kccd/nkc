const router = require('koa-router')();
const articleRouter = require("./article");
const momentRouter = require('./moment');
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .use('/article', articleRouter.routes(), articleRouter.allowedMethods())
  .use('/moment', momentRouter.routes(), momentRouter.allowedMethods())
module.exports = router;