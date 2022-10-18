const router = require('koa-router')();
const creationRouter = require('./creation');
const authenticationRouter = require('./authentication');
const tokenRouter = require('./token');
router
  .use('/token', tokenRouter.routes(), tokenRouter.allowedMethods())
  .use('/creation', creationRouter.routes(), creationRouter.allowedMethods())
  .use('/authentication', authenticationRouter.routes(), authenticationRouter.allowedMethods())
module.exports = router;
