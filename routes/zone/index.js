const router = require('koa-router')();
const articleRouter = require('./article');
router
  .use('/a', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;