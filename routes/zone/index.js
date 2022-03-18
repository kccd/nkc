const router = require('koa-router')();
const articleRouter = require('./article');
const momentRouter = require('./moment');
router
  .use('/m', momentRouter.routes(), momentRouter.allowedMethods())
  .use('/a', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;