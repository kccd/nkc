const router = require('koa-router')();
const creationRouter = require('./creation');
const authenticationRouter = require('./authentication');
router
  .use('/creation', creationRouter.routes(), creationRouter.allowedMethods())
  .use('/authentication', authenticationRouter.routes(), authenticationRouter.allowedMethods())
module.exports = router;
