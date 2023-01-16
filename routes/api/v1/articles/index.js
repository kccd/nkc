const router = require('koa-router')();
const selectorRouter = require('./selector');
router
  .use('/selector', selectorRouter.routes(), selectorRouter.allowedMethods());
module.exports = router;
