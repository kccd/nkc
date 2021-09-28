const router = require('koa-router')();
const refuseRouter = require('./refuse');
const restoreRouter = require('./restore');
const auditRouter = require('./audit');
const stopRouter = require('./stop');
const timeoutRouter = require('./timeout');
const withdrawRouter = require('./withdraw');
const refundRouter = require('./refund');
router
  .use('/refuse', refuseRouter.routes(), refuseRouter.allowedMethods())
  .use('/restore', restoreRouter.routes(), restoreRouter.allowedMethods())
  .use('/audit', auditRouter.routes(), auditRouter.allowedMethods())
  .use('/stop', stopRouter.routes(), stopRouter.allowedMethods())
  .use('/timeout', timeoutRouter.routes(), timeoutRouter.allowedMethods())
  .use('/withdraw', withdrawRouter.routes(), withdrawRouter.allowedMethods())
  .use('/refund', refundRouter.routes(), refundRouter.allowedMethods())
module.exports = router;