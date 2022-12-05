const router = require('koa-router')();
const authenticationRouter = require('./authentication');
router
  .use('/authentication', authenticationRouter.routes(), authenticationRouter.allowedMethods())
module.exports = router;
