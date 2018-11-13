const Router = require('koa-router');
const router = new Router();
const subscriptionRouter = require('./subscription');
router
  .use('subscription', subscriptionRouter.routes(), subscriptionRouter.allowedMethods());
module.exports = router;