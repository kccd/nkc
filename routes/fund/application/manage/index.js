const router = require('koa-router')();
const refuseRouter = require('./refuse');
const restoreRouter = require('./restore');
const auditRouter = require('./audit');
const stopRouter = require('./stop');
router
  .use('/refuse', refuseRouter.routes(), refuseRouter.allowedMethods())
  .use('/restore', restoreRouter.routes(), restoreRouter.allowedMethods())
  .use('/audit', auditRouter.routes(), auditRouter.allowedMethods())
  .use('/stop', stopRouter.routes(), stopRouter.allowedMethods())
module.exports = router;