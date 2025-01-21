const Router = require('koa-router');
const router = new Router();
const mobileRouter = require('./mobile');
const emailRouter = require('./email');
router
  .use('/email', emailRouter.routes(), emailRouter.allowedMethods())
  .use('/mobile', mobileRouter.routes(), mobileRouter.allowedMethods());
module.exports = router;
