const router = require('koa-router')();
const digestRouter = require('./digest');

router
  .use('/digest', digestRouter.routes(), digestRouter.allowedMethods())

module.exports = router;
