const router = require('koa-router')();
const digestRouter = require('./digest');
const creditRouter = require('./credit');
router
  .use('/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/credit', creditRouter.routes(), creditRouter.allowedMethods())
module.exports = router;
