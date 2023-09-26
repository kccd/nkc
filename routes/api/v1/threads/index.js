const Router = require('koa-router');
const router = new Router();
const selectorRouter = require('./selector');
router.use(
  '/selector',
  selectorRouter.routes(),
  selectorRouter.allowedMethods(),
);
module.exports = router;
