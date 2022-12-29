const router = require('koa-router')();
const v1Router = require('./v1');
router
  .use('/v1', v1Router.routes(), v1Router.allowedMethods());
module.exports = router;
